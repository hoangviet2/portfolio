# %% [markdown]
# # SukhoiBot — a tiny chess net that plays like Sukhoi35
#
# **What it learns**
# - Games that include **Sukhoi35** → learn every move Sukhoi35 played (both colors).
# - Games without Sukhoi35 → learn the **winning side's** moves. On a draw, learn the side with the
#   **lower Elo** (it held a stronger opponent). Equal/missing Elo on a draw → both sides.
#
# **How it trains**
# 1. Pre-train on the elite games (general chess sense).
# 2. Fine-tune on Sukhoi35's own games (style), validated on held-out Sukhoi35 games.
#
# **Model**: a ~460k-parameter residual CNN (6 blocks × 64 channels) that outputs a
# from-square × to-square policy (4096 logits). Exported as fp16 weights (~0.9 MB) that the
# portfolio site runs directly in the browser — no server, no ONNX runtime.
#
# Runtime → Change runtime type → **T4 GPU**, then Runtime → Run all.

# %% [markdown]
# ## 1. Setup & data download

# %%
import os, sys, subprocess

IN_COLAB = "google.colab" in sys.modules
if IN_COLAB:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "python-chess", "gdown"], check=True)

# Google Drive folder that holds the .pgn files (shared "anyone with the link").
DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1aEgKHoE-usMW73fcOw6j4-UNNiaVCbrM?usp=sharing"
DATA_DIR = os.environ.get("DATA_DIR", "/content/data" if IN_COLAB else "../data")
OUT_DIR = os.environ.get("OUT_DIR", "/content/out" if IN_COLAB else "./out")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

def have_pgns():
    return any(f.lower().endswith(".pgn") for f in os.listdir(DATA_DIR))

if IN_COLAB and not have_pgns():
    import gdown
    try:
        gdown.download_folder(DRIVE_FOLDER_URL, output=DATA_DIR, quiet=False, remaining_ok=True)
    except Exception as e:
        # gdown can be rate-limited by Google. Fallback: open the folder link, "Add shortcut to
        # Drive" into My Drive, then mount Drive and read it from there.
        print("gdown failed:", e, "\nFalling back to mounting Google Drive...")
        from google.colab import drive
        drive.mount("/content/drive")
        DATA_DIR = os.environ.get("DRIVE_DATA_DIR", "/content/drive/MyDrive/data")

PGN_FILES = sorted(
    os.path.join(root, f)
    for root, _, files in os.walk(DATA_DIR) for f in files if f.lower().endswith(".pgn")
)
print("PGN files:", *PGN_FILES, sep="\n  ")
assert PGN_FILES, f"No .pgn files found in {DATA_DIR}"

# %% [markdown]
# ## 2. Config

# %%
PLAYER = "Sukhoi35"            # you
ELITE_MAX_GAMES = int(os.environ.get("ELITE_MAX_GAMES", 150_000))  # cap on non-Sukhoi games (None = all)
MIN_PLIES = 10                 # skip games shorter than this (aborts / instant resigns)
CHANNELS, BLOCKS = 64, 6       # model size — the whole point is to stay tiny
BATCH = 1024
PRETRAIN_EPOCHS = int(os.environ.get("PRETRAIN_EPOCHS", 4))
FINETUNE_EPOCHS = int(os.environ.get("FINETUNE_EPOCHS", 6))
VAL_FRACTION = 0.05            # of Sukhoi35 games, held out to measure "plays like me" accuracy
SEED = 35

# %% [markdown]
# ## 3. Parse PGNs → compact position arrays
#
# Every position is stored from the **side-to-move's perspective** (board mirrored when Black is to
# move), so one network plays both colors. One position = 64 bytes of squares + 2 bytes of state + a
# move index — about 70 bytes, so millions of positions fit in Colab RAM.

# %%
import re, io, time, random
import numpy as np
import chess
import multiprocessing as mp

HEADER_RE = re.compile(r'^\[(\w+)\s+"(.*)"\]\s*$', re.M)
COMMENT_RE = re.compile(r"\{[^}]*\}|\([^)]*\)|\$\d+|;[^\n]*")
MOVENUM_RE = re.compile(r"^\d+\.+$|^\d+\.+")
RESULTS = {"1-0", "0-1", "1/2-1/2", "*"}

def iter_game_texts(path):
    """Yield raw PGN text per game (split on [Event lines) — much faster than chess.pgn.read_game."""
    buf = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if line.startswith("[Event ") and buf:
                yield "".join(buf)
                buf = []
            buf.append(line)
    if buf:
        yield "".join(buf)

def elo(h, key):
    try:
        return int(h.get(key, ""))
    except ValueError:
        return None

def sides_to_learn(h, player):
    """Which colors' moves to learn from this game. Returns (set_of_colors, is_player_game)."""
    white, black = h.get("White", ""), h.get("Black", "")
    pl = player.lower()
    if white.lower() == pl or black.lower() == pl:
        return ({chess.WHITE} if white.lower() == pl else {chess.BLACK}), True
    res = h.get("Result", "*")
    if res == "1-0":
        return {chess.WHITE}, False
    if res == "0-1":
        return {chess.BLACK}, False
    if res == "1/2-1/2":
        we, be = elo(h, "WhiteElo"), elo(h, "BlackElo")
        if we is not None and be is not None and we != be:
            return ({chess.WHITE} if we < be else {chess.BLACK}), False
        return {chess.WHITE, chess.BLACK}, False
    return set(), False

def encode(board):
    """Board → (64 int8 squares, castling bits, ep file) from the side-to-move's view.
    Square codes: 0 empty, 1..6 own P,N,B,R,Q,K, 7..12 opponent P..K. Index = rank*8+file (a1=0)."""
    us = board.turn
    flip = 0 if us == chess.WHITE else 56
    sq = np.zeros(64, np.int8)
    for s, p in board.piece_map().items():
        sq[s ^ flip] = p.piece_type + (0 if p.color == us else 6)
    them = not us
    castle = (board.has_kingside_castling_rights(us)
              | board.has_queenside_castling_rights(us) << 1
              | board.has_kingside_castling_rights(them) << 2
              | board.has_queenside_castling_rights(them) << 3)
    ep = chess.square_file(board.ep_square) if board.has_legal_en_passant() else 8
    return sq, castle, ep

def move_index(move, turn):
    flip = 0 if turn == chess.WHITE else 56
    return (move.from_square ^ flip) * 64 + (move.to_square ^ flip)

def parse_game(text):
    """→ (squares[n,64], state[n,2], moves[n], is_player) or None."""
    h = dict(HEADER_RE.findall(text))
    if h.get("Variant", "Standard") not in ("Standard", "") or "FEN" in h:
        return None
    colors, is_player = sides_to_learn(h, PLAYER)
    if not colors:
        return None
    body = HEADER_RE.sub("", text)
    body = COMMENT_RE.sub(" ", body)
    tokens = [MOVENUM_RE.sub("", t) for t in body.split()]
    tokens = [t for t in tokens if t and t not in RESULTS]
    if len(tokens) < MIN_PLIES:
        return None
    board = chess.Board()
    sqs, states, moves = [], [], []
    try:
        for tok in tokens:
            mv = board.parse_san(tok)
            if board.turn in colors:
                s, c, e = encode(board)
                sqs.append(s); states.append((c, e)); moves.append(move_index(mv, board.turn))
            board.push(mv)
    except ValueError:
        pass  # keep the moves parsed before a malformed token
    if not moves:
        return None
    return np.stack(sqs), np.array(states, np.uint8), np.array(moves, np.int16), is_player

def _parse_many(texts):
    return [r for r in map(parse_game, texts) if r is not None]

def load_all(pgn_files, elite_cap):
    player_games, elite_games = [], []
    full = lambda: elite_cap is not None and len(elite_games) >= elite_cap
    t0 = time.time()
    # fork keeps notebook-defined functions visible to workers (Colab/Linux default; also works on macOS)
    ctx = mp.get_context("fork") if "fork" in mp.get_all_start_methods() else mp.get_context()
    with ctx.Pool(os.cpu_count()) as pool:
        for path in pgn_files:
            def chunks():
                batch = []
                for txt in iter_game_texts(path):
                    # once the elite cap is hit, only bother parsing games that include the player
                    if full() and PLAYER.lower() not in txt[:1000].lower():
                        continue
                    batch.append(txt)
                    if len(batch) == 500:
                        yield batch
                        batch = []
                if batch:
                    yield batch
            for results in pool.imap(_parse_many, chunks()):
                for r in results:
                    if r[3]:
                        player_games.append(r)
                    elif not full():
                        elite_games.append(r)
            print(f"  {os.path.basename(path)}: player games={len(player_games)} "
                  f"elite games={len(elite_games)} ({time.time()-t0:.0f}s)")
    return player_games, elite_games

def stack(games):
    return (np.concatenate([g[0] for g in games]),
            np.concatenate([g[1] for g in games]),
            np.concatenate([g[2] for g in games]).astype(np.int64))

CACHE = os.path.join(OUT_DIR, f"positions_{ELITE_MAX_GAMES}.npz")
if os.path.exists(CACHE):
    z = np.load(CACHE)
    P_tr = (z["p_tr_s"], z["p_tr_c"], z["p_tr_m"]); P_va = (z["p_va_s"], z["p_va_c"], z["p_va_m"])
    E = (z["e_s"], z["e_c"], z["e_m"])
else:
    player_games, elite_games = load_all(PGN_FILES, ELITE_MAX_GAMES)
    rng = random.Random(SEED)
    rng.shuffle(player_games)
    n_val = max(1, int(len(player_games) * VAL_FRACTION))
    P_va, P_tr, E = stack(player_games[:n_val]), stack(player_games[n_val:]), stack(elite_games)
    np.savez(CACHE, p_tr_s=P_tr[0], p_tr_c=P_tr[1], p_tr_m=P_tr[2],
             p_va_s=P_va[0], p_va_c=P_va[1], p_va_m=P_va[2], e_s=E[0], e_c=E[1], e_m=E[2])
    del player_games, elite_games

print(f"{PLAYER} positions: train={len(P_tr[2]):,} val={len(P_va[2]):,} | elite positions={len(E[2]):,}")

# %% [markdown]
# ## 4. Model

# %%
import torch
import torch.nn as nn
import torch.nn.functional as F

DEVICE = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
IN_PLANES = 12 + 4 + 1  # pieces, castling rights, en-passant file
torch.manual_seed(SEED)

def to_planes(sq, state):
    """GPU-side expansion: int8 squares [N,64] + state [N,2] → float planes [N,17,8,8]."""
    n = sq.shape[0]
    pieces = F.one_hot(sq.long(), 13)[..., 1:].permute(0, 2, 1).float()          # [N,12,64]
    castle = state[:, 0].long()
    bits = torch.stack([(castle >> i) & 1 for i in range(4)], 1).float()           # [N,4]
    castle_planes = bits[:, :, None].expand(n, 4, 64)
    ep = state[:, 1].long()
    ep_plane = torch.zeros(n, 1, 64, device=sq.device)
    has_ep = ep < 8
    # the en-passant target square is on rank 6 from the mover's view (index 40 + file)
    ep_plane[has_ep, 0, 40 + ep[has_ep]] = 1.0
    return torch.cat([pieces, castle_planes, ep_plane], 1).view(n, IN_PLANES, 8, 8)

class Block(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.c1, self.b1 = nn.Conv2d(c, c, 3, padding=1, bias=False), nn.BatchNorm2d(c)
        self.c2, self.b2 = nn.Conv2d(c, c, 3, padding=1, bias=False), nn.BatchNorm2d(c)

    def forward(self, x):
        y = F.relu(self.b1(self.c1(x)))
        return F.relu(x + self.b2(self.c2(y)))

class SukhoiNet(nn.Module):
    def __init__(self, c=CHANNELS, blocks=BLOCKS):
        super().__init__()
        self.stem = nn.Sequential(nn.Conv2d(IN_PLANES, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU())
        self.blocks = nn.Sequential(*[Block(c) for _ in range(blocks)])
        self.policy = nn.Conv2d(c, 64, 1)  # channel = to-square, spatial = from-square

    def forward(self, x):
        y = self.policy(self.blocks(self.stem(x)))       # [N, 64(to), 8, 8(from)]
        return y.flatten(2).transpose(1, 2).flatten(1)   # [N, from*64 + to]

model = SukhoiNet().to(DEVICE)
print(f"params: {sum(p.numel() for p in model.parameters()):,} | device: {DEVICE}")

# %% [markdown]
# ## 5. Training

# %%
def batches(data, batch, shuffle):
    sq, st, mv = data
    idx = np.random.permutation(len(mv)) if shuffle else np.arange(len(mv))
    for i in range(0, len(idx), batch):
        j = idx[i:i + batch]
        yield (torch.from_numpy(sq[j]).to(DEVICE), torch.from_numpy(st[j]).to(DEVICE),
               torch.from_numpy(mv[j]).to(DEVICE))

@torch.no_grad()
def evaluate(data):
    model.eval()
    hit1 = hit3 = n = 0
    for sq, st, mv in batches(data, 4096, False):
        logits = model(to_planes(sq, st))
        top = logits.topk(3, 1).indices
        hit1 += (top[:, 0] == mv).sum().item()
        hit3 += (top == mv[:, None]).any(1).sum().item()
        n += len(mv)
    return hit1 / max(n, 1), hit3 / max(n, 1)

def train(data, epochs, lr, tag):
    steps = epochs * ((len(data[2]) + BATCH - 1) // BATCH)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=lr, total_steps=steps, pct_start=0.1)
    use_amp = DEVICE == "cuda"
    scaler = torch.amp.GradScaler("cuda", enabled=use_amp)
    for ep in range(epochs):
        model.train()
        t0, tot, n = time.time(), 0.0, 0
        for sq, st, mv in batches(data, BATCH, True):
            with torch.autocast("cuda", dtype=torch.float16, enabled=use_amp):
                loss = F.cross_entropy(model(to_planes(sq, st)), mv, label_smoothing=0.05)
            opt.zero_grad(set_to_none=True)
            scaler.scale(loss).backward()
            scaler.step(opt); scaler.update(); sched.step()
            tot += loss.item() * len(mv); n += len(mv)
        a1, a3 = evaluate(P_va)
        print(f"[{tag}] epoch {ep+1}/{epochs} loss={tot/n:.3f} | {PLAYER} held-out: "
              f"top1={a1:.1%} top3={a3:.1%} ({time.time()-t0:.0f}s)")

if len(E[2]):
    train(E, PRETRAIN_EPOCHS, lr=2e-3, tag="pretrain-elite")
train(P_tr, FINETUNE_EPOCHS, lr=5e-4, tag=f"finetune-{PLAYER}")
torch.save(model.state_dict(), os.path.join(OUT_DIR, "sukhoi_bot.pt"))

# %% [markdown]
# ## 6. Export for the website
#
# BatchNorm is folded into the convolutions and weights are written as fp16 — `sukhoi-bot.json` +
# `sukhoi-bot.bin`. Copy both into the portfolio repo at `public/chess-bot/`.

# %%
import json

def fold(conv, bn):
    w = conv.weight.detach().float()
    b = conv.bias.detach().float() if conv.bias is not None else torch.zeros(w.shape[0], device=w.device)
    if bn is None:
        return w, b
    scale = bn.weight.detach() / torch.sqrt(bn.running_var + bn.eps)
    return w * scale[:, None, None, None], (b - bn.running_mean) * scale + bn.bias.detach()

def export(path_prefix):
    model.eval()
    layers = [fold(model.stem[0], model.stem[1])]
    for blk in model.blocks:
        layers += [fold(blk.c1, blk.b1), fold(blk.c2, blk.b2)]
    layers.append(fold(model.policy, None))
    blobs, meta, offset = [], [], 0
    for i, (w, b) in enumerate(layers):
        for kind, t in (("w", w), ("b", b)):
            a = t.cpu().numpy().astype(np.float16).ravel()
            meta.append({"name": f"{i}.{kind}", "shape": list(t.shape), "offset": offset, "length": a.size})
            blobs.append(a); offset += a.size
    with open(path_prefix + ".bin", "wb") as fh:
        fh.write(np.concatenate(blobs).tobytes())
    with open(path_prefix + ".json", "w") as fh:
        json.dump({"name": "SukhoiBot", "player": PLAYER, "channels": CHANNELS, "blocks": BLOCKS,
                   "inPlanes": IN_PLANES, "dtype": "float16", "tensors": meta,
                   "valTop1": round(evaluate(P_va)[0], 4)}, fh)
    print(f"wrote {path_prefix}.bin ({offset*2/1e6:.2f} MB) and {path_prefix}.json")

export(os.path.join(OUT_DIR, "sukhoi-bot"))

# %% [markdown]
# ## 7. Quick sanity check + download

# %%
def bot_move(board, temperature=0.0):
    sq, castle, ep = encode(board)
    planes = to_planes(torch.from_numpy(sq[None]).to(DEVICE),
                       torch.tensor([[castle, ep]], dtype=torch.uint8, device=DEVICE))
    with torch.no_grad():
        logits = model.eval()(planes)[0].float().cpu()
    legal = list(board.legal_moves)
    scores = torch.tensor([logits[move_index(m, board.turn)].item() for m in legal])
    if temperature <= 0:
        return legal[int(scores.argmax())]
    return legal[int(torch.multinomial(F.softmax(scores / temperature, 0), 1))]

b = chess.Board()
for _ in range(16):
    b.push(bot_move(b))
print("Bot vs bot opening:", chess.Board().variation_san(b.move_stack))

if IN_COLAB:
    from google.colab import files
    files.download(os.path.join(OUT_DIR, "sukhoi-bot.json"))
    files.download(os.path.join(OUT_DIR, "sukhoi-bot.bin"))
