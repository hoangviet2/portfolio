import type { Metadata } from "next";
import ChessArena from "./ChessArena";

export const metadata: Metadata = {
  title: "Chess Arena | Viet Hoang",
  description: "Play chess against Viet Hoang — a tiny neural network trained on Viet's own games to play in Viet's style.",
};

export default function ChessPage() {
  return <ChessArena />;
}
