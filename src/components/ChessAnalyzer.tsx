"use client";
import React, { useState, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess/ChessBoard";
import EvalBar from "./chess/EvalBar";
import PGNImport from "@/components/import/PGNImport";
import PlayerBoard from "@/components/chess/PlayerBoard";
import BotChat from "./chess/BotChat";

import {
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  ChevronFirst,
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

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { TemplateContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { log } from "node:console";

const ChessAnalyzer = () => {
  const [game, setGame] = useState(new Chess());
  const [evalBar, setEvalBar] = useState(0);
  const [pgn, setPgn] = useState("");
  const [p1name, setP1Name] = useState("zayoo");
  const [p2name, setP2Name] = useState("magnus");
  const [p1elo, setP1Elo] = useState(2700);
  const [p2elo, setP2Elo] = useState(2604);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-2);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isPlayingRef = useRef(false);
  const currentMoveIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [bestMove, setBestMove] = useState("");
  const [chesstychat, setChesstyChat] = useState(
    "click on analyze to start analysing your match!",
  );
  const [history, setHistory] = useState<any[]>([]);

  const loadPGN = (pgn: string, game: Chess) => {
    try {
      game.loadPgn(pgn);
      setPgn(pgn);
      setGame(game);
      const hist = game.history({ verbose: true });
      setHistory(hist);
      setCurrentMoveIndex(hist.length - 1);
      setIsAnalyzing(true);
      setEvaluation(0);
      setBestMove("");
      setChesstyChat("Analyzing...");
    } catch (error) {
      console.error("Error loading PGN:", error);
    }
  };

  const nextMove = () => {
    if (
      history.length > 0 &&
      currentMoveIndex < history.length - 1 &&
      !isPlayingRef.current
    ) {
      setCurrentMoveIndex(currentMoveIndex + 1);
      const tempChess = new Chess();
      const moves = history.slice(0, currentMoveIndex + 2); // +2 because we incremented currentMoveIndex
      for (const move of moves) {
        const mv = {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        };
        tempChess.move(mv);
      }
      setGame(tempChess);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex >= 0 && !isPlayingRef.current) {
      setCurrentMoveIndex(currentMoveIndex - 1);
      const tempChess = new Chess();
      const moves = history.slice(0, currentMoveIndex);
      for (const move of moves) {
        tempChess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
      }
      setGame(tempChess);
    }
  };

  const firstMove = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      currentMoveIndexRef.current = -1;
    }

    setCurrentMoveIndex(-1);
    setGame(new Chess());
  };

  const lastMove = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }

    setCurrentMoveIndex(history.length - 1);
    currentMoveIndexRef.current = history.length - 1;

    const tempChess = new Chess();
    tempChess.loadPgn(pgn);
    setGame(tempChess);
  };

  const playMove = () => {
    if (!isPlayingRef.current && currentMoveIndex < history.length - 1) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      currentMoveIndexRef.current = currentMoveIndex;
      playNextMove();
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentMoveIndex(currentMoveIndexRef.current);
    }
  };

  const playNextMove = () => {
    if (
      !isPlayingRef.current ||
      currentMoveIndexRef.current >= history.length
    ) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentMoveIndex(currentMoveIndexRef.current);
      return;
    }

    const nextMove = history[currentMoveIndexRef.current + 1];
    game.move({
      from: nextMove.from,
      to: nextMove.to,
      promotion: nextMove.promotion,
    });

    currentMoveIndexRef.current += 1;
    setGame(new Chess(game.fen()));

    if (currentMoveIndexRef.current < history.length - 1) {
      setTimeout(() => playNextMove(), 1000);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentMoveIndex(currentMoveIndexRef.current);
    }
  };

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
    <div className="flex flex-col justify-start h-screen">
      {/* Header */}
      <Card className="flex flex-shrink-0 items-center p-4 m-3">
        <CardContent>
          <label className="text-2xl font-bold">chessty</label>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="flex grow items-center justify-around gap-6 p-4">
        <div className="flex flex-col justify-evenly w-full h-full gap-5 max-h-3/4">
          <PlayerBoard
            p1name={p1name}
            p2name={p2name}
            p1elo={p1elo}
            p2elo={p2elo}
          />
          <BotChat chesstychat={chesstychat} />
          <br />
        </div>

        <div className="flex flex-col grow h-full max-h-4/5 gap-4">
          <Card className="flex p-4 h-full max-h-full">
            <div className="flex-1 grid grid-cols-[auto_1fr] gap-3">
              <div className="select-none">
                <EvalBar eval={0} />
              </div>
              <div className="">
                <ChessBoard game={game} />
              </div>
            </div>
          </Card>
          <div className="flex flex-row justify-center">
            <Card className="flex flex-row justify-center p-1.5 gap-1">
              <Button
                className="bg-[#323130] hover:bg-[#474944]"
                size="lg"
                onClick={firstMove}
              >
                <ChevronFirst color="#adadad" />
              </Button>
              <Button
                className="bg-[#323130] hover:bg-[#474944]"
                size="lg"
                onClick={previousMove}
              >
                <ChevronLeft color="#adadad" />
              </Button>
              <Button
                className="bg-[#323130] hover:bg-[#474944]"
                size="lg"
                onClick={playMove}
              >
                {isPlayingRef.current ? (
                  <Pause fill="#adadad" strokeWidth={0} />
                ) : (
                  <Play fill="#adadad" strokeWidth={0} />
                )}
              </Button>
              <Button
                className="bg-[#323130] hover:bg-[#474944]"
                size="lg"
                onClick={nextMove}
              >
                <ChevronRight color="#adadad" />
              </Button>
              <Button
                className="bg-[#323130] hover:bg-[#474944]"
                size="lg"
                onClick={lastMove}
              >
                <ChevronLast color="#adadad" />
              </Button>
            </Card>
          </div>
        </div>

        <div className="w-full gap-2 h-full max-h-2/4">
          <PGNImport pgn={pgn} setPgn={setPgn} loadPGN={loadPGN} />
        </div>
      </div>
    </div>
  );
};

export default ChessAnalyzer;
