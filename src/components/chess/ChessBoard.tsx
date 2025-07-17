"use client";

import { Chessboard } from "react-chessboard";

const pieces = [
  "wP",
  "wN",
  "wB",
  "wR",
  "wQ",
  "wK",
  "bP",
  "bN",
  "bB",
  "bR",
  "bQ",
  "bK",
];

const customPieces = {};
pieces.forEach((piece) => {
  customPieces[piece] = () => (
    <svg viewBox="0 0 24 24">
      <image href={`/chessPieces/${piece}.png`} width="100%" height="100%" />
    </svg>
  );
});

export default function ChessBoard({
  game,
  bestMove,
  customSquareStyles,
  boardOrientation,
}) {
  const chessboardOptions = {
    pieces: customPieces,
    boardOrientation: boardOrientation,
    position: game.fen(),
    boardStyle: {
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
    },
    darkSquareStyle: {
      backgroundColor: "#779952",
    },
    lightSquareStyle: {
      backgroundColor: "#edeed1",
    },
    animationDurationInMs: 100,
    allowDrawingArrows: true,
    arrows: bestMove
      ? [
          {
            startSquare: bestMove.substring(0, 2),
            endSquare: bestMove.substring(2, 4),
            color: "rgb(168 224 47)",
          },
        ]
      : undefined,
    squareStyles: customSquareStyles,
  };

  return <Chessboard options={chessboardOptions} />;
}
