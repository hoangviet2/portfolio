"use client";
import { motion } from "framer-motion";

// Teaser on the home page; the playable board lives at /chess/.
const preview: (string | null)[][] = [
  ["blackr", null, "blackb", "blackq", "blackk", null, null, "blackr"],
  ["blackp", "blackp", "blackp", "blackp", null, "blackp", "blackp", "blackp"],
  [null, null, "blackkn", null, null, "blackkn", null, null],
  [null, null, "blackb", null, "blackp", null, null, null],
  [null, null, "whiteb", null, "whitep", null, null, null],
  [null, null, null, "whitep", null, "whitekn", null, null],
  ["whitep", "whitep", "whitep", null, null, "whitep", "whitep", "whitep"],
  ["whiter", "whitekn", "whiteb", "whiteq", "whitek", null, null, "whiter"],
];

export default function ChessBoardSection() {
  return (
    <motion.section
      id="chess"
      className="w-full max-w-6xl px-4 py-20 mx-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative rounded-3xl border border-line bg-surface/80 shadow-glass overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-uw-purple via-uw-lavender to-uw-gold" />
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center p-8 md:p-12">
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-chip text-accent text-xs font-semibold tracking-wide uppercase">
              New · Deep learning
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Play chess against my AI twin</h2>
            <p className="text-muted text-base md:text-lg max-w-xl">
              SukhoiBot is a ~460k-parameter neural network trained on 8,700 of my chess.com games
              (plus elite Lichess games for fundamentals) to predict the move <em>I</em> would play.
              It runs entirely in your browser.
            </p>
            <motion.a
              href="/chess/"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex w-fit items-center gap-2 px-7 py-3 rounded-2xl font-semibold bg-uw-purple text-white dark:bg-uw-gold dark:text-uw-spirit-purple shadow-lg"
            >
              Open the Chess Arena <span aria-hidden>→</span>
            </motion.a>
          </div>

          <a href="/chess/" aria-label="Open the Chess Arena" className="justify-self-center">
            <div className="grid grid-cols-8 rounded-2xl overflow-hidden shadow-xl ring-4 ring-uw-gold/40 w-64 md:w-72">
              {preview.map((row, r) =>
                row.map((piece, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`relative aspect-square ${(r + c) % 2 === 0 ? "bg-uw-cream" : "bg-uw-purple"}`}
                  >
                    {piece && (
                      <img src={`/chess/${piece}.svg`} alt="" className="absolute inset-[8%] w-[84%] h-[84%]" draggable={false} />
                    )}
                  </div>
                ))
              )}
            </div>
          </a>
        </div>
      </div>
    </motion.section>
  );
}
