"use client";

import { Chessboard } from "react-chessboard";
import { useMemo } from "react";

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
  customPieces[piece] = ({ squareWidth }) => (
    <div
      style={{
        width: squareWidth,
        height: squareWidth,
        backgroundImage: `url(/chessPieces/${piece}.png)`,
        backgroundSize: "100%",
      }}
    />
  );
});

export default function ChessBoard({ game }) {
  return (
    <div>
      <Chessboard
        id="StyledBoard"
        boardOrientation="black"
        position={game.fen()}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customDarkSquareStyle={{
          backgroundColor: "#779952",
        }}
        customLightSquareStyle={{
          backgroundColor: "#edeed1",
        }}
        customPieces={customPieces}
      />
    </div>
  );
}
