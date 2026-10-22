// Pure-TypeScript inference for SukhoiNet (see chess-bot/sukhoi_bot.py).
// The network is tiny (~460k params), so a hand-written conv loop runs in well under 100ms
// and the site needs no ML runtime — just the fp16 weights in /public/chess-bot/.

export interface SukhoiManifest {
  name: string;
  player: string;
  channels: number;
  blocks: number;
  inPlanes: number;
  dtype: "float16";
  valTop1?: number;
  tensors: { name: string; shape: number[]; offset: number; length: number }[];
}

interface Layer {
  w: Float32Array;
  b: Float32Array;
  cout: number;
  cin: number;
  k: number;
}

export interface SukhoiNet {
  manifest: SukhoiManifest;
  params: number;
  bytes: number;
  layers: Layer[];
}

export interface MoveScore {
  from: string;
  to: string;
  promotion?: string;
  prob: number;
}

function halfToFloat(h: number): number {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const f = h & 0x03ff;
  if (e === 0) return s * f * 2 ** -24;
  if (e === 31) return f ? NaN : s * Infinity;
  return s * (1 + f / 1024) * 2 ** (e - 15);
}

export async function loadSukhoiNet(baseUrl: string): Promise<SukhoiNet> {
  const [manifestRes, binRes] = await Promise.all([fetch(`${baseUrl}.json`), fetch(`${baseUrl}.bin`)]);
  if (!manifestRes.ok || !binRes.ok) throw new Error("SukhoiBot weights not found");
  const manifest: SukhoiManifest = await manifestRes.json();
  const buf = await binRes.arrayBuffer();
  const halves = new Uint16Array(buf);
  const byName = new Map(manifest.tensors.map((t) => [t.name, t]));
  const read = (name: string) => {
    const t = byName.get(name);
    if (!t) throw new Error(`missing tensor ${name}`);
    const out = new Float32Array(t.length);
    for (let i = 0; i < t.length; i++) out[i] = halfToFloat(halves[t.offset + i]);
    return { data: out, shape: t.shape };
  };
  const layers: Layer[] = [];
  const nLayers = 1 + manifest.blocks * 2 + 1;
  for (let i = 0; i < nLayers; i++) {
    const w = read(`${i}.w`);
    layers.push({ w: w.data, b: read(`${i}.b`).data, cout: w.shape[0], cin: w.shape[1], k: w.shape[2] });
  }
  return { manifest, params: halves.length, bytes: buf.byteLength, layers };
}

// Conv over an 8x8 board with "same" padding; input/output laid out [channel][rank][file].
function conv(x: Float32Array, { w, b, cout, cin, k }: Layer, relu: boolean, residual?: Float32Array) {
  const out = new Float32Array(cout * 64);
  const pad = k >> 1;
  for (let o = 0; o < cout; o++) {
    const ob = o * 64;
    out.fill(b[o], ob, ob + 64);
    for (let i = 0; i < cin; i++) {
      const xb = i * 64;
      const wb = (o * cin + i) * k * k;
      for (let ky = 0; ky < k; ky++) {
        const dy = ky - pad;
        const y0 = Math.max(0, -dy);
        const y1 = Math.min(8, 8 - dy);
        for (let kx = 0; kx < k; kx++) {
          const wv = w[wb + ky * k + kx];
          if (wv === 0) continue;
          const dx = kx - pad;
          const x0 = Math.max(0, -dx);
          const x1 = Math.min(8, 8 - dx);
          for (let y = y0; y < y1; y++) {
            const row = ob + y * 8;
            const src = xb + (y + dy) * 8 + dx;
            for (let xx = x0; xx < x1; xx++) out[row + xx] += wv * x[src + xx];
          }
        }
      }
    }
  }
  if (residual) for (let i = 0; i < out.length; i++) out[i] += residual[i];
  if (relu) for (let i = 0; i < out.length; i++) if (out[i] < 0) out[i] = 0;
  return out;
}

const PIECE_CODE: Record<string, number> = { p: 1, n: 2, b: 3, r: 4, q: 5, k: 6 };

const squareIndex = (sq: string) => (sq.charCodeAt(1) - 49) * 8 + (sq.charCodeAt(0) - 97);

/** FEN → input planes, from the side-to-move's view (mirrors training-time `encode`). */
export function encodeFen(fen: string, inPlanes = 17): Float32Array {
  const [placement, turn, castling, ep] = fen.split(" ");
  const white = turn === "w";
  const flip = white ? 0 : 56;
  const x = new Float32Array(inPlanes * 64);
  const ranks = placement.split("/");
  for (let r = 0; r < 8; r++) {
    let file = 0;
    for (const ch of ranks[r]) {
      if (ch >= "1" && ch <= "8") {
        file += Number(ch);
        continue;
      }
      const lower = ch.toLowerCase();
      const isWhitePiece = ch !== lower;
      const code = PIECE_CODE[lower] + (isWhitePiece === white ? 0 : 6);
      const sq = ((7 - r) * 8 + file) ^ flip;
      x[(code - 1) * 64 + sq] = 1;
      file++;
    }
  }
  const rights = white ? ["K", "Q", "k", "q"] : ["k", "q", "K", "Q"];
  rights.forEach((c, i) => {
    if (castling.includes(c)) x.fill(1, (12 + i) * 64, (13 + i) * 64);
  });
  if (ep && ep !== "-") x[16 * 64 + 40 + (ep.charCodeAt(0) - 97)] = 1;
  return x;
}

/** Raw 4096 logits indexed [from*64 + to] in the side-to-move's (mirrored) coordinates. */
export function forward(net: SukhoiNet, fen: string): Float32Array {
  const { layers, manifest } = net;
  let h = conv(encodeFen(fen, manifest.inPlanes), layers[0], true);
  for (let i = 0; i < manifest.blocks; i++) {
    const y = conv(h, layers[1 + 2 * i], true);
    h = conv(y, layers[2 + 2 * i], true, h);
  }
  const policy = conv(h, layers[layers.length - 1], false); // [to][from]
  const logits = new Float32Array(4096);
  for (let to = 0; to < 64; to++) for (let from = 0; from < 64; from++) logits[from * 64 + to] = policy[to * 64 + from];
  return logits;
}

/**
 * Softmax over the legal moves only. `legal` are chess.js-style verbose moves; under-promotions
 * share a from/to slot with the queen promotion, so only queen promotions are kept.
 */
export function scoreMoves(
  net: SukhoiNet,
  fen: string,
  legal: { from: string; to: string; promotion?: string }[],
  temperature = 1,
): MoveScore[] {
  const logits = forward(net, fen);
  const flip = fen.split(" ")[1] === "w" ? 0 : 56;
  const moves = legal.filter((m) => !m.promotion || m.promotion === "q");
  const t = Math.max(temperature, 1e-3);
  const z = moves.map((m) => logits[(squareIndex(m.from) ^ flip) * 64 + (squareIndex(m.to) ^ flip)] / t);
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, v) => a + v, 0);
  return moves
    .map((m, i) => ({ from: m.from, to: m.to, promotion: m.promotion, prob: e[i] / sum }))
    .sort((a, b) => b.prob - a.prob);
}

/** temperature 0 → always the move Sukhoi35 most likely plays; higher → more variety. */
export function sampleMove(scores: MoveScore[], temperature: number): MoveScore {
  if (temperature <= 0.05 || scores.length === 1) return scores[0];
  const w = scores.map((s) => s.prob ** (1 / temperature));
  let r = Math.random() * w.reduce((a, v) => a + v, 0);
  for (let i = 0; i < scores.length; i++) {
    r -= w[i];
    if (r <= 0) return scores[i];
  }
  return scores[scores.length - 1];
}
