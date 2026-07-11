"use client";

import { useState } from "react";

const initialBoard: (string | null)[][] = [
  ["blackr", "blackkn", "blackb", "blackq", "blackk", "blackb", "blackkn", "blackr"],
  ["blackp", "blackp", "blackp", "blackp", "blackp", "blackp", "blackp", "blackp"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["whitep", "whitep", "whitep", "whitep", "whitep", "whitep", "whitep", "whitep"],
  ["whiter", "whitekn", "whiteb", "whiteq", "whitek", "whiteb", "whitekn", "whiter"],
];

const isWhitePiece = (piece: string | null) => piece?.startsWith("white");

const pieceOffsets: Record<string, { x: number; y: number }> = {
  default: { x: -2, y: 0 },
};

const getPieceOffset = (piece: string) => pieceOffsets[piece] ?? pieceOffsets.default;

export default function ChessBoardSection() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (!selected) {
      if (piece) {
        setSelected({ row, col });
      }
      return;
    }

    if (selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    const selectedPiece = board[selected.row][selected.col];
    const sameColor = piece && selectedPiece && isWhitePiece(piece) === isWhitePiece(selectedPiece);

    if (sameColor) {
      setSelected({ row, col });
      return;
    }

    const nextBoard = board.map((r) => r.slice());
    nextBoard[row][col] = selectedPiece;
    nextBoard[selected.row][selected.col] = null;

    setBoard(nextBoard);
    setSelected(null);
    setLastMove({
      from: `${String.fromCharCode(97 + selected.col)}${8 - selected.row}`,
      to: `${String.fromCharCode(97 + col)}${8 - row}`,
    });
  };

  return (
    <section
      id="chess"
      className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-20"
    >
      <div className="flex flex-col gap-6 md:gap-10">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">Chess Arena</h2>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
            Interactive board with your custom pieces. This will later stream live games from your bot server.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="rounded-3xl border border-purple-200/50 bg-white/80 dark:bg-white/5 dark:border-white/10 shadow-xl p-4">
            <div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const isLightSquare = (rowIndex + colIndex) % 2 === 0;
                  const isSelected = selected?.row === rowIndex && selected?.col === colIndex;

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      className={`relative aspect-square w-10 sm:w-12 md:w-14 lg:w-16 grid place-items-center p-0 leading-none transition-colors duration-200 ${
                        isLightSquare ? "bg-white" : "bg-purple-800"
                      } ${isSelected ? "ring-4 ring-purple-300" : ""}`}
                      aria-label={`Square ${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`}
                    >
                      {piece && (
                        <img
                          src={`/chess/${piece}.svg`}
                          alt={piece}
                          className="absolute left-1/2 top-1/2 w-[70%] h-[70%] object-contain pointer-events-none"
                          style={{
                            transform: `translate(-50%, -50%) translate(${getPieceOffset(piece).x}px, ${getPieceOffset(piece).y}px)`,
                          }}
                          draggable={false}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-purple-200/60 bg-white/80 dark:bg-white/5 dark:border-white/10 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black dark:text-white">Status</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2">
                {lastMove
                  ? `Last move: ${lastMove.from} -> ${lastMove.to}`
                  : "Select a piece and click a destination square to move."}
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200/60 bg-gradient-to-br from-white to-purple-50 dark:from-white/5 dark:to-white/10 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black dark:text-white">Coming Soon</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2">
                Live moves from your bot will replace this local state when the server integration is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
