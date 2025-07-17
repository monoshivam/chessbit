"use client";
import { analyzePositions } from "@/sf/stockfish17";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess/ChessBoard";
import EvalBar from "./chess/EvalBar";
import PGNImport from "@/components/import/PGNImport";
import PlayerBoard from "@/components/chess/PlayerBoard";
import EvalGraph from "./chess/EvalGraph";

import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  ChevronFirst,
  RefreshCcw,
} from "lucide-react";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";

const ChessAnalyzer = () => {
  const [game, setGame] = useState(new Chess());
  const [pgn, setPgn] = useState("");
  const [whitePlayerInfo, setWhitePlayerInfo] = useState({
    name: "White",
    elo: "0000",
  });
  const [blackPlayerInfo, setBlackPlayerInfo] = useState({
    name: "Black",
    elo: "0000",
  });
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-2);
  const [lastMadeMove, setLastMadeMove] = useState<object>({});
  const [analyzingState, setAnalyzingState] = useState<number>(1);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const isPlayingRef = useRef(false);
  const currentMoveIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [mateIn, setMateIn] = useState(0);
  const [bestMove, setBestMove] = useState("");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [history, setHistory] = useState<object[]>([]);
  const isFirstRender = useRef(true);
  const analysis = useRef<any[]>([]);

  const loadPGN = (pgn: string, game: Chess) => {
    try {
      game.loadPgn(pgn);
      setPgn(pgn);
      setGame(game);
      const hist = game.history({ verbose: true });
      setHistory(hist);
      setCurrentMoveIndex(hist.length - 1);
      setLastMadeMove(hist[hist.length - 1]);
      setEvaluation(0);
      setBestMove("");
      extractPlayerInfo(pgn);
      console.log(hist);
    } catch (error) {
      console.error("Error loading PGN:", error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Skip the first run
      return;
    }
    setAnalyzingState(2);

    const runBatchAnalysis = async () => {
      try {
        const positions = history.map((move) => move.before);

        const batchResult = await analyzePositions({
          positions: positions,
          depth: 12,
          onProgress: (completed, total, currentResult) => {
            const progress = (completed / total) * 100;
            setAnalysisProgress(progress);
            console.log(
              `Progress: ${completed}/${total} (${progress.toFixed(1)}%)`,
            );
          },
        });
        if (game.isCheckmate()) {
          const winner = game.turn() === "w" ? "black" : "white";
          if (winner == "white") {
            batchResult.results.push({ eval: 10, mate: 999 });
          } else {
            batchResult.results.push({ eval: -10, mate: -999 });
          }
        } else if (game.isInsufficientMaterial() || game.isStalemate()) {
          batchResult.results.push({ eval: 0 });
        } else {
          const tfen = history[history.length - 1].after;
          const tPosition: string[] = [tfen];
          const bResult = await analyzePositions({
            positions: tPosition,
            depth: 12,
            engineType: "multithread",
            onProgress: (completed, total, currentResult) => {
              const progress = (completed / total) * 100;
              setAnalysisProgress(progress);
              console.log(
                `Progress: ${completed}/${total} (${progress.toFixed(1)}%)`,
              );
            },
          });
          const tEvaluation = bResult.results[0];
          batchResult.results.push(tEvaluation);
        }

        analysis.current = batchResult.results;
        console.log("Batch analysis complete:", analysis.current);

        if (batchResult.completed === positions.length) {
          setAnalyzingState(3);
        }
      } catch (error) {
        console.error("Batch analysis error:", error);
      }
    };
    runBatchAnalysis();
  }, [history]);

  useEffect(() => {
    if (
      analysis.current.length == history.length + 1 &&
      analysis.current.length != 0
    ) {
      try {
        if (analysis.current[currentMoveIndex + 1].mate != null) {
          setMateIn(Number(analysis.current[currentMoveIndex + 1].mate));
        } else {
          setMateIn(0);
          setEvaluation(analysis.current[currentMoveIndex + 1].eval);
        }
        if (currentMoveIndex == -1) {
          setBestMove(null);
        } else {
          const bm = analysis.current[currentMoveIndex].moves.split(" ");
          setBestMove(bm[0] || "");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      }
    }
    if (currentMoveIndex == -1) {
      setBestMove(null);
      setEvaluation(0);
    }
  }, [game.fen()]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMadeMove) {
      styles[lastMadeMove.from] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };

      styles[lastMadeMove.to] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };
    }
    if (game.isCheckmate()) {
      const kingColor = game.turn();
      const kingSquare = game
        .board()
        .flat()
        .find(
          (square) =>
            square && square.type === "k" && square.color === kingColor,
        )?.square;

      if (kingSquare) {
        styles[kingSquare] = {
          backgroundColor: "rgba(255, 0, 0, 0.6)",
        };
      }
    }

    return styles;
  }, [lastMadeMove, game]);

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
      setLastMadeMove(moves[moves.length - 1]);
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
      setLastMadeMove(moves[moves.length - 1]);
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
    setLastMadeMove(null);
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
    setLastMadeMove(history[history.length - 1]);
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
    setGame(game);
    setLastMadeMove(history[currentMoveIndexRef.current]);

    if (currentMoveIndexRef.current < history.length - 1) {
      setTimeout(() => playNextMove(), 1000);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentMoveIndex(currentMoveIndexRef.current);
    }
  };

  function extractPlayerInfo(pgn: string) {
    const getTagValue = (tag: string) => {
      const match = pgn.match(new RegExp(`\\[${tag} "(.*?)"\\]`));
      return match ? match[1] : "";
    };
    setWhitePlayerInfo({
      name: getTagValue("White"),
      elo: parseInt(getTagValue("WhiteElo"), 10),
    });
    setBlackPlayerInfo({
      name: getTagValue("Black"),
      elo: parseInt(getTagValue("BlackElo"), 10),
    });
  }

  const rotateBoard = () => {
    setBoardOrientation(boardOrientation == "white" ? "black" : "white");
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

                      1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. h4 1-0`;
  // useEffect(() => {
  //   loadPGN(samplePgn, new Chess());
  // }, []);

  return (
    <div className="">
      <Card className="h-16 items-center p-4 m-3">
        <CardContent>
          <label className="text-2xl font-bold">chessty</label>
        </CardContent>
      </Card>
      <div className="flex flex-col lg:flex-row gap-10 lg:min-h-[calc(100vh-8rem)]">
        <div className="hidden lg:block w-[calc(3vw)] rounded-xs"></div>
        <div className="m-1 lg:m-3">
          <div className="hidden lg:block h-[calc(5vh)] rounded-xs"></div>
          <div className="ml-9 mb-1.5 lg:mb-2.5">
            <PlayerBoard playerInfo={blackPlayerInfo} />
          </div>
          <Card
            id="chessBoard"
            className="lg:flex-1 grid grid-cols-[auto_1fr] gap-2 p-2 rounded-sm place-content-center"
          >
            <EvalBar
              eval={evaluation}
              mateIn={mateIn}
              orientation={boardOrientation}
            />
            <div className="lg:min-h-[calc(100vh-24rem-10px)] max-h-[calc(100vh-18rem-8px)] aspect-square">
              <ChessBoard
                game={game}
                bestMove={bestMove}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
              />
            </div>
          </Card>
          <div className="ml-9 mt-1.5 lg:mb-2.5">
            <PlayerBoard playerInfo={whitePlayerInfo} />
          </div>
        </div>
        <div className="hidden lg:block w-[2px] bg-neutral-500 rounded-xs"></div>
        <div className="flex-1 relative lg:m-3 ">
          {analyzingState == 1 ? (
            <Tabs
              className="items-center w-full h-[calc(100%-3rem)]"
              defaultValue="pgn"
            >
              <TabsList>
                <TabsTrigger value="pgn">From PGN</TabsTrigger>
                <TabsTrigger value="chesscom">chess.com</TabsTrigger>
              </TabsList>
              <TabsContent value="pgn" className="w-full p-3 h-full">
                <PGNImport pgn={pgn} setPgn={setPgn} loadPGN={loadPGN} />
              </TabsContent>
              <TabsContent value="chesscom"></TabsContent>
            </Tabs>
          ) : undefined}
          {analyzingState == 2 ? (
            <div className="w-full h-full flex lg:justify-center flex-col items-center">
              <label className="mb-2 font-bold text-neutral-200">
                Analyzing...
              </label>
              <Progress
                value={analysisProgress}
                className="w-[90%] h-6 rounded-md transition-all"
              />
            </div>
          ) : undefined}
          {analyzingState == 3 ? (
            <div className="flex flex-col gap-2">
              <Card className="items-center p-1.5 m-3 mb-0 rounded-md">
                <CardContent>
                  <label className="text-sm font-bold">Game Review</label>
                </CardContent>
              </Card>
              <div className="h-20 bg-[#403d39] m-3 mt-0 rounded-sm overflow-hidden">
                <EvalGraph analysisData={analysis.current} />
              </div>
              <Card className="w-full"></Card>
            </div>
          ) : undefined}

          <div id="spacer" className="h-16 lg:h-0"></div>
          <Card className="flex flex-row p-1.5 gap-1 fixed bottom-0 w-full rounded-b-none lg:absolute lg:rounded-sm">
            <Button
              className="bg-[#323130] hover:bg-[#474944] flex-1"
              size="lg"
              onClick={firstMove}
            >
              <ChevronFirst color="#adadad" />
            </Button>
            <Button
              className="bg-[#323130] hover:bg-[#474944] flex-1"
              size="lg"
              onClick={previousMove}
            >
              <ChevronLeft color="#adadad" />
            </Button>
            <Button
              className="bg-[#323130] hover:bg-[#474944] flex-1"
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
              className="bg-[#323130] hover:bg-[#474944] flex-1"
              size="lg"
              onClick={nextMove}
            >
              <ChevronRight color="#adadad" />
            </Button>
            <Button
              className="bg-[#323130] hover:bg-[#474944] flex-1"
              size="lg"
              onClick={lastMove}
            >
              <ChevronLast color="#adadad" />
            </Button>
          </Card>
        </div>
        <div className="hidden lg:block w-[calc(3vw)] rounded-xs"></div>
      </div>
    </div>
  );
};

export default ChessAnalyzer;
