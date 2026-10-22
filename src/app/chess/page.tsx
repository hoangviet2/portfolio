import type { Metadata } from "next";
import ChessArena from "./ChessArena";

export const metadata: Metadata = {
  title: "Chess Arena | Viet Hoang",
  description: "Play against SukhoiBot, a tiny neural network trained to play chess like Viet (Sukhoi35).",
};

export default function ChessPage() {
  return <ChessArena />;
}
