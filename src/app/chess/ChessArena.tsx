"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chess, type Square, type PieceSymbol, type Color } from "chess.js";
import { loadSukhoiNet, sampleMove, scoreMoves, type MoveScore, type SukhoiNet } from "./lib/sukhoiNet";

const FILES = "abcdefgh";
const MODEL_URL = "/chess-bot/sukhoi-bot";
const BOT_DELAY_MS = 450;

type NetStatus = "loading" | "ready" | "missing";
type ScoredMove = MoveScore & { san: string };

const pieceSrc = (type: PieceSymbol, color: Color) =>
  `/chess/${color === "w" ? "white" : "black"}${type === "n" ? "kn" : type}.svg`;

function gameStatus(game: Chess, player: Color): { text: string; over: boolean } {
  const toMove = game.turn() === player ? "You" : "SukhoiBot";
  if (game.isCheckmate()) return { text: game.turn() === player ? "Checkmate — SukhoiBot wins!" : "Checkmate — you win!", over: true };
  if (game.isStalemate()) return { text: "Draw by stalemate", over: true };
  if (game.isThreefoldRepetition()) return { text: "Draw by threefold repetition", over: true };
  if (game.isInsufficientMaterial()) return { text: "Draw — insufficient material", over: true };
  if (game.isDraw()) return { text: "Draw by the 50-move rule", over: true };
  return { text: `${toMove} to move${game.inCheck() ? " — check!" : ""}`, over: false };
}

export default function ChessArena() {
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  const [fen, setFen] = useState(game.fen());
  const [player, setPlayer] = useState<Color>("w");
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [temperature, setTemperature] = useState(0.6);
  const [net, setNet] = useState<SukhoiNet | null>(null);
  const [netStatus, setNetStatus] = useState<NetStatus>("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSukhoiNet(MODEL_URL)
      .then((n) => {
        setNet(n);
        setNetStatus("ready");
      })
      .catch(() => setNetStatus("missing"));
  }, []);

  const sync = useCallback(() => {
    setFen(game.fen());
    setSelected(null);
  }, [game]);

  const history = useMemo(() => game.history(), [fen, game]);
  const status = useMemo(() => gameStatus(game, player), [fen, game, player]);
  const orientation: Color = (player === "w") !== flipped ? "w" : "b";

  // What would Sukhoi35 play in the current position? Drives both the bot and the hint panel.
  const candidates: ScoredMove[] = useMemo(() => {
    if (status.over) return [];
    const legal = game.moves({ verbose: true });
    const san = new Map(legal.map((m) => [m.from + m.to + (m.promotion ?? ""), m.san]));
    const scores = net
      ? scoreMoves(net, fen, legal)
      : legal.map((m) => ({ from: m.from, to: m.to, promotion: m.promotion, prob: 1 / legal.length }));
    return scores.map((s) => ({ ...s, san: san.get(s.from + s.to + (s.promotion ?? "")) ?? "" }));
  }, [fen, net, status.over, game]);

  // Bot's turn
  const botToMove = game.turn() !== player && !status.over && netStatus !== "loading";
  useEffect(() => {
    if (!botToMove || candidates.length === 0) return;
    const timer = setTimeout(() => {
      const pick = sampleMove(candidates, temperature);
      const move = game.move({ from: pick.from, to: pick.to, promotion: pick.promotion ?? "q" });
      setLastMove({ from: move.from, to: move.to });
      sync();
    }, BOT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [botToMove, candidates, temperature, game, sync]);

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(game.moves({ square: selected, verbose: true }).map((m) => m.to));
  }, [selected, fen, game]);

  const kingInCheck = useMemo(() => {
    if (!game.inCheck()) return null;
    for (const row of game.board()) for (const p of row) if (p && p.type === "k" && p.color === game.turn()) return p.square;
    return null;
  }, [fen, game]);

  const tryMove = (from: Square, to: Square, promo?: PieceSymbol) => {
    const options = game.moves({ square: from, verbose: true }).filter((m) => m.to === to);
    if (options.length === 0) return false;
    if (options.some((m) => m.promotion) && !promo) {
      setPromotion({ from, to });
      return true;
    }
    const move = game.move({ from, to, promotion: promo });
    setLastMove({ from: move.from, to: move.to });
    setPromotion(null);
    sync();
    return true;
  };

  const canMoveNow = game.turn() === player && !status.over && !promotion;

  const onSquare = (sq: Square) => {
    if (!canMoveNow) return;
    const piece = game.get(sq);
    if (selected && selected !== sq && tryMove(selected, sq)) return;
    setSelected(piece && piece.color === player && selected !== sq ? sq : null);
  };

  const newGame = (color: Color) => {
    game.reset();
    setPlayer(color);
    setFlipped(false);
    setLastMove(null);
    setPromotion(null);
    sync();
  };

  const undo = () => {
    // Take back the bot's reply and your move, so it's your turn again
    game.undo();
    if (game.turn() !== player) game.undo();
    const prev = game.history({ verbose: true }).at(-1);
    setLastMove(prev ? { from: prev.from, to: prev.to } : null);
    setPromotion(null);
    sync();
  };

  const copyPgn = async () => {
    game.setHeader("White", player === "w" ? "You" : "SukhoiBot");
    game.setHeader("Black", player === "b" ? "You" : "SukhoiBot");
    try {
      await navigator.clipboard.writeText(game.pgn());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — ignore
    }
  };

  const rows = [...Array(8)].map((_, r) => (orientation === "w" ? 8 - r : r + 1));
  const cols = [...Array(8)].map((_, c) => (orientation === "w" ? c : 7 - c));
  const thinking = botToMove;
  const top = candidates.slice(0, 5);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-10 flex flex-col gap-3"
      >
        <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-chip text-accent text-xs font-semibold tracking-wide uppercase">
          Chess Arena
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
          Play against{" "}
          <span className="bg-gradient-to-r from-uw-purple via-[#6d4fb0] to-uw-heritage-gold dark:from-uw-lavender dark:via-uw-gold dark:to-uw-spirit-gold text-transparent bg-clip-text">
            SukhoiBot
          </span>
        </h1>
        <p className="text-muted text-base md:text-lg max-w-3xl">
          A tiny deep-learning model trained to move like me — <strong className="text-ink">Sukhoi35</strong> on
          chess.com. It has no search and no engine: every move is a single neural-network guess at what I would
          play, computed right here in your browser.
        </p>
      </motion.header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
        {/* Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-[min(640px,calc(100svh-10rem))] mx-auto lg:mx-0"
        >
          <div className="flex items-center justify-between mb-3 px-1 text-sm">
            <PlayerTag name="SukhoiBot" color={player === "w" ? "b" : "w"} active={thinking} subtitle={thinking ? "thinking…" : "neural net · no search"} />
          </div>

          <div className="relative rounded-2xl p-2 md:p-3 bg-gradient-to-br from-uw-purple to-uw-spirit-purple dark:from-uw-gold/60 dark:to-uw-heritage-gold/60 shadow-2xl">
            <div className="grid grid-cols-8 rounded-xl overflow-hidden select-none aspect-square">
              {rows.map((rank) =>
                cols.map((file) => {
                  const sq = `${FILES[file]}${rank}` as Square;
                  const piece = game.get(sq);
                  const light = (file + rank) % 2 === 0; // a1 is dark
                  const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
                  const isTarget = legalTargets.has(sq);
                  const showRank = file === cols[0];
                  const showFile = rank === rows[7];
                  return (
                    <button
                      key={sq}
                      type="button"
                      onClick={() => onSquare(sq)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (selected && canMoveNow) tryMove(selected, sq);
                      }}
                      aria-label={`${sq}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                      className={`relative aspect-square ${light ? "bg-uw-cream" : "bg-[#6a4fa3]"}`}
                    >
                      {isLast && <span className="absolute inset-0 bg-uw-spirit-gold/35" />}
                      {selected === sq && <span className="absolute inset-0 bg-uw-gold/60" />}
                      {kingInCheck === sq && (
                        <span className="absolute inset-0" style={{ background: "radial-gradient(circle, rgba(220,38,38,0.85) 0%, rgba(220,38,38,0.35) 55%, transparent 75%)" }} />
                      )}
                      {showRank && (
                        <span className={`absolute left-1 top-0.5 text-[10px] md:text-xs font-semibold ${light ? "text-uw-purple" : "text-uw-cream"}`}>{rank}</span>
                      )}
                      {showFile && (
                        <span className={`absolute right-1 bottom-0.5 text-[10px] md:text-xs font-semibold ${light ? "text-uw-purple" : "text-uw-cream"}`}>{FILES[file]}</span>
                      )}
                      {piece && (
                        <img
                          src={pieceSrc(piece.type, piece.color)}
                          alt=""
                          draggable={canMoveNow && piece.color === player}
                          onDragStart={() => setSelected(sq)}
                          className="absolute inset-[6%] w-[88%] h-[88%] z-10 transition-transform duration-150 hover:scale-105"
                        />
                      )}
                      {isTarget && (
                        <span
                          className={`absolute z-20 pointer-events-none rounded-full ${
                            piece ? "inset-[4%] ring-4 ring-uw-spirit-gold/80" : "left-1/2 top-1/2 w-[28%] h-[28%] -translate-x-1/2 -translate-y-1/2 bg-uw-spirit-gold/80 shadow"
                          }`}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Promotion picker */}
            <AnimatePresence>
              {promotion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 grid place-items-center bg-black/40 backdrop-blur-sm rounded-2xl"
                >
                  <div className="bg-surface rounded-2xl p-4 shadow-2xl border border-line">
                    <p className="text-sm font-semibold text-ink mb-3 text-center">Promote to</p>
                    <div className="flex gap-2">
                      {(["q", "r", "b", "n"] as PieceSymbol[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => tryMove(promotion.from, promotion.to, p)}
                          className="w-16 h-16 rounded-xl bg-chip hover:bg-uw-gold/40 transition-colors p-1"
                          aria-label={`Promote to ${p}`}
                        >
                          <img src={pieceSrc(p, player)} alt="" className="w-full h-full" />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPromotion(null)} className="mt-3 w-full text-xs text-muted hover:text-ink">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-3 px-1 text-sm">
            <PlayerTag name="You" color={player} active={canMoveNow} subtitle={canMoveNow ? "your move" : ""} />
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Status</h2>
                <p className={`mt-1 text-lg font-semibold ${status.over ? "text-accent" : "text-ink"}`}>{status.text}</p>
              </div>
              <ModelBadge status={netStatus} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Btn onClick={() => newGame("w")} primary={player === "w"}>New game · White</Btn>
              <Btn onClick={() => newGame("b")} primary={player === "b"}>New game · Black</Btn>
              <Btn onClick={undo} disabled={history.length === 0 || thinking}>Undo</Btn>
              <Btn onClick={() => setFlipped((f) => !f)}>Flip board</Btn>
            </div>
          </Card>

          <Card>
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {game.turn() === player ? "What Sukhoi35 would play here" : "SukhoiBot is considering"}
              </h2>
            </div>
            {top.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Game over.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {top.map((m, i) => (
                  <li key={m.from + m.to + (m.promotion ?? "")} className="flex items-center gap-3">
                    <span className="w-14 font-mono font-semibold text-ink">{m.san}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-chip overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-uw-purple to-uw-gold" : "bg-uw-lavender dark:bg-uw-lavender/60"}`}
                        initial={false}
                        animate={{ width: `${Math.max(m.prob * 100, 2)}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm tabular-nums text-muted">{(m.prob * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-5 block">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Focused (always my top move)</span>
                <span>Creative</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-uw-purple dark:accent-uw-gold"
                aria-label="Bot creativity (sampling temperature)"
              />
            </label>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Moves</h2>
              <button onClick={copyPgn} disabled={history.length === 0} className="text-xs font-semibold text-accent disabled:opacity-40">
                {copied ? "Copied!" : "Copy PGN"}
              </button>
            </div>
            <ol className="mt-3 max-h-56 overflow-y-auto grid grid-cols-[2.5rem_1fr_1fr] gap-y-1 text-sm font-mono">
              {history.length === 0 && <li className="col-span-3 text-muted font-sans">No moves yet.</li>}
              {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
                <li key={i} className="contents">
                  <span className="text-muted">{i + 1}.</span>
                  <span className="text-ink">{history[2 * i]}</span>
                  <span className="text-ink">{history[2 * i + 1] ?? ""}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">How it works</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <strong className="text-ink">Data:</strong> every move I played in ~8,700 chess.com games, plus elite
                Lichess games (winner&apos;s moves; on draws, the lower-rated side).
              </li>
              <li>
                <strong className="text-ink">Model:</strong> 6-block residual CNN, 64 channels
                {net ? ` — ${(net.params / 1000).toFixed(0)}k params, ${(net.bytes / 1024).toFixed(0)} KB` : ""}.
              </li>
              <li>
                <strong className="text-ink">Training:</strong> pre-trained on elite games, fine-tuned on mine
                {net?.manifest.valTop1 ? ` — matches my exact move ${(net.manifest.valTop1 * 100).toFixed(0)}% of the time on unseen games` : ""}.
              </li>
            </ul>
          </Card>
        </motion.aside>
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-line bg-surface/80 backdrop-blur-xl shadow-glass p-5 md:p-6">{children}</div>;
}

function Btn({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 hover:-translate-y-0.5 ${
        primary
          ? "bg-uw-purple text-white dark:bg-uw-gold dark:text-uw-spirit-purple shadow-md"
          : "bg-chip text-ink hover:bg-uw-lavender/40 dark:hover:bg-uw-lavender/20"
      }`}
    >
      {children}
    </button>
  );
}

function PlayerTag({ name, color, active, subtitle }: { name: string; color: Color; active: boolean; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-9 h-9 rounded-xl grid place-items-center border border-line ${color === "w" ? "bg-white" : "bg-[#1f1236]"}`}>
        <img src={pieceSrc("k", color)} alt="" className="w-7 h-7" />
      </span>
      <div className="leading-tight">
        <p className="font-semibold text-ink flex items-center gap-2">
          {name}
          {active && <span className="w-2 h-2 rounded-full bg-uw-spirit-gold animate-pulse" />}
        </p>
        <p className="text-xs text-muted min-h-4">{subtitle}</p>
      </div>
    </div>
  );
}

function ModelBadge({ status }: { status: NetStatus }) {
  const label = { loading: "Loading model…", ready: "Model ready", missing: "Model missing" }[status];
  const tone = {
    loading: "bg-chip text-muted",
    ready: "bg-uw-gold/25 text-uw-heritage-gold dark:text-uw-gold",
    missing: "bg-red-500/15 text-red-600 dark:text-red-400",
  }[status];
  return (
    <span
      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${tone}`}
      title={status === "missing" ? "Weights not found in /public/chess-bot/ — playing random legal moves" : undefined}
    >
      {label}
    </span>
  );
}
