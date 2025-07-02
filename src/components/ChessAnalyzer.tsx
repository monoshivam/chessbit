"use client";
import React, { useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess/ChessBoard";
import EvalBar from "./chess/EvalBar";
import PGNImport from "@/components/import/PGNImport";

import {
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  MessageSquare,
  Settings,
  Book,
  Database,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Star,
  Send,
  Divide,
} from "lucide-react";

import { Card } from "./ui/card";

const ChessAnalyzer = () => {
  const [game, setGame] = useState(new Chess());
  const [evalBar, setEvalBar] = useState(0);
  const [pgn, setPgn] = useState("");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [bestMove, setBestMove] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      type: "ai",
      message:
        "Hello! I'm your chess analysis assistant. Import a game to get started!",
    },
  ]);

  const samplePgn = `[Event "Live Chess"]
                      [Site "Chess.com"]
                      [Date "2024.01.15"]
                      [Round "-"]
                      [White "Player1"]
                      [Black "Player2"]
                      [Result "1-0"]
                      [WhiteElo "1800"]
                      [BlackElo "1750"]

                      1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0`;

  return (
    <div className="flex justify-around items-center min-h-screen p-4 ">
      <Card className="p-5">
        <div className="grid grid-cols-[auto_1fr] items-start gap-6">
          <div className="h-full select-none">
            <div className="w-6 h-[min(90vmin,500px)]">
              <EvalBar eval={evalBar} />
            </div>
          </div>
          <div className="w-[min(90vmin,500px)] aspect-square">
            <ChessBoard game={game} />
          </div>
        </div>
      </Card>

      <div className="h-full max-w-130 w-full gap-2">
        <PGNImport pgn={pgn} setPgn={setPgn} />
      </div>
    </div>
  );
};

export default ChessAnalyzer;
