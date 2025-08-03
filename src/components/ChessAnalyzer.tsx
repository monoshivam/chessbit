"use client";
import { analyzePositions } from "@/analysis/stockfish17";
import { verdict } from "@/analysis/moves";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/chess/ChessBoard";
import EvalBar from "./chess/EvalBar";
import PGNImport from "@/components/import/PGNImport";
import ChessComImport from "@/components/import/ChessComImport";
import PlayerBoard from "@/components/chess/PlayerBoard";
import EvalGraph from "./chess/EvalGraph";
import MoveType from "./chess/MoveType";
import MoveBox from "./chess/MoveBox";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ChessAnalyzer = () => {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());

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
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentMoveIndexRef = useRef(0);
  const [evaluation, setEvaluation] = useState(0);
  const [mateIn, setMateIn] = useState(0);
  const [bestMove, setBestMove] = useState("");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [history, setHistory] = useState<object[]>([]);
  const isFirstRender = useRef(true);
  const analysis = useRef<any[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const verdicts = useRef<string[]>([]);

  const engine = useRef<string>("lite");
  const [chosen, setChosen] = useState("lite");
  const [isOpen, setIsOpen] = useState(false);
  const handleEngineChange = (value) => {
    engine.current = value;
    setChosen(value);
    setIsOpen(false);
  };

  const playSound = useCallback(() => {
    let soundType = "move";
    if (lastMadeMove == null) {
      soundType = "game-start";
    } else if (
      gameRef.current.isCheckmate() ||
      gameRef.current.isDraw() ||
      gameRef.current.isStalemate()
    ) {
      soundType = "game-end";
    } else if (gameRef.current.isCheck()) {
      soundType = "check";
    } else {
      if (lastMadeMove.flags.includes("c")) {
        soundType = "capture";
      } else if (
        lastMadeMove.flags.includes("k") ||
        lastMadeMove.flags.includes("q")
      ) {
        soundType = "castle";
      } else if (lastMadeMove.flags.includes("p")) {
        soundType = "promote";
      }
    }

    const sound = new Audio(`/sounds/${soundType}.mp3`);
    sound.play().catch(console.error);
  }, [lastMadeMove]);

  const loadPGN = useCallback((pgn: string) => {
    try {
      gameRef.current.loadPgn(pgn);
      setPgn(pgn);
      setFen(gameRef.current.fen());
      const hist = gameRef.current.history({ verbose: true });
      setHistory(hist);
      setCurrentMoveIndex(hist.length - 1);
      setLastMadeMove(hist[hist.length - 1]);
      setEvaluation(0);
      setBestMove("");
      extractPlayerInfo(pgn);
      // console.log(hist);
    } catch (error) {
      console.error("Error loading PGN:", error);
    }
  }, []);

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
          engine: engine.current,
          onProgress: (completed, total) => {
            const progress = (completed / total) * 100;
            setAnalysisProgress(progress);
            console.log(
              `Progress: ${completed}/${total} (${progress.toFixed(1)}%)`,
            );
          },
        });
        batchResult.results.forEach((obj, index) => {
          if (index % 2 == 1) {
            obj.eval = -obj.eval;
            obj.winChance = 100 - obj.winChance;
            obj.centipawns = -obj.centipawns;
            if (obj.mate != null) {
              obj.mate = -obj.mate;
              if (obj.mate > 0) obj.winChance = 100;
              else obj.winChance = 0;
            }
          } else {
            if (obj.mate != null) {
              if (obj.mate > 0) obj.winChance = 100;
              else obj.winChance = 0;
            }
          }
        });
        batchResult.results[0].eval = 0;
        batchResult.results[0].winChance = 50;
        batchResult.results[0].centipawns = 0;

        if (gameRef.current.isCheckmate()) {
          const winner = gameRef.current.turn() === "w" ? "black" : "white";
          if (winner == "white") {
            batchResult.results.push({ eval: 10, mate: 999, winChance: 100 });
          } else {
            batchResult.results.push({ eval: -10, mate: -999, winChance: 0 });
          }
        } else if (
          gameRef.current.isInsufficientMaterial() ||
          gameRef.current.isStalemate()
        ) {
          batchResult.results.push({ eval: 0 });
        } else {
          const tfen = history[history.length - 1].after;
          const tPosition: string[] = [tfen];
          const bResult = await analyzePositions({
            positions: tPosition,
            depth: 12,
            engine: engine.current,
            onProgress: (completed, total) => {
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

        for (let i = 1; i < batchResult.results.length; i++) {
          // console.log("MOVE: ", i);

          const turn: string = i % 2 === 0 ? "w" : "b";
          const bMove: string = analysis.current[i - 1].moves.split(" ")[0];
          const moveMade: string = history[i - 1].from + history[i - 1].to;
          if (bMove == moveMade) {
            verdicts.current.push("bestmove");
            continue;
          }

          verdicts.current.push(
            verdict(turn, analysis.current[i], analysis.current[i - 1]),
          );
        }

        console.log("Batch analysis complete:", analysis.current);
        console.log("Verdicts: ", verdicts.current);

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
        playSound();

        if (analysis.current[currentMoveIndex + 1].mate != null) {
          setMateIn(Number(analysis.current[currentMoveIndex + 1].mate));
        } else {
          setMateIn(0);
          setEvaluation(analysis.current[currentMoveIndex + 1].eval);
        }
        if (currentMoveIndex == -1 || isPlayingRef.current) {
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
  }, [fen]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const moveType = verdicts.current[currentMoveIndex];

    let backColor: string;
    if (moveType == "bestmove") backColor = "rgba(166, 230, 101, 0.47)";
    else if (moveType == "goodmove") backColor = "rgba(166, 230, 101, 0.47)";
    else if (moveType == "inaccuracy") backColor = "rgba(59, 157, 247, 0.3)";
    else if (moveType == "mistake") backColor = "rgba(255, 164, 89, 0.4)";
    else if (moveType == "blunder") backColor = "rgba(250, 65, 45, 0.4)";
    else backColor = "rgba(255, 255, 0, 0.4)";

    if ((!moveType && lastMadeMove) || isPlayingRef.current) {
      styles[lastMadeMove.from] = {
        backgroundColor: `${backColor}`,
      };

      styles[lastMadeMove.to] = {
        position: "relative",
        backgroundColor: `${backColor}`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top 0px right 0px",
        backgroundSize: "40%",
      };
    } else if (lastMadeMove) {
      styles[lastMadeMove.from] = {
        backgroundColor: `${backColor}`,
      };

      styles[lastMadeMove.to] = {
        position: "relative",
        backgroundColor: `${backColor}`,
        backgroundImage: `
            url(/moveTypes/${moveType}.png)
          `,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top 0px right 0px",
        backgroundSize: "40%",
      };
    }
    if (gameRef.current.isCheckmate()) {
      const kingColor = gameRef.current.turn();
      const kingSquare = gameRef.current
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
  }, [lastMadeMove, currentMoveIndex]);

  const nextMove = useCallback(() => {
    if (
      currentMoveIndex < history.length - 1 &&
      !isPlayingRef.current &&
      history.length > 0
    ) {
      const nextMoveIndex = currentMoveIndex + 1;
      const move = history[nextMoveIndex];
      gameRef.current.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      setCurrentMoveIndex(nextMoveIndex);
      setFen(gameRef.current.fen());
      setLastMadeMove(move);
    }
  }, [currentMoveIndex, history]);

  const moveClick = (fen, moveIndex) => {
    if (!isPlayingRef.current) {
      gameRef.current.load(fen);
      setCurrentMoveIndex(moveIndex);
      setFen(fen);
      setLastMadeMove(history[moveIndex]);
    }
  };

  const previousMove = useCallback(() => {
    if (currentMoveIndex >= 0 && !isPlayingRef.current && history.length > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
      gameRef.current.load(history[currentMoveIndex].before); // Simply undo the last move
      setFen(gameRef.current.fen());
      setLastMadeMove(history[currentMoveIndex - 1] || null);
    }
  }, [currentMoveIndex, history]);

  const firstMove = useCallback(() => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      currentMoveIndexRef.current = -1;
    }

    setCurrentMoveIndex(-1);
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setLastMadeMove(null);
  }, []);

  const lastMove = useCallback(() => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      currentMoveIndexRef.current = history.length - 1;
    }

    gameRef.current.loadPgn(pgn);
    setFen(gameRef.current.fen());
    setCurrentMoveIndex(history.length - 1);
    setLastMadeMove(history[history.length - 1]);
  }, [history, pgn]);

  const playNextMove = useCallback(() => {
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
    gameRef.current.move({
      from: nextMove.from,
      to: nextMove.to,
      promotion: nextMove.promotion,
    });

    currentMoveIndexRef.current += 1;
    setCurrentMoveIndex(currentMoveIndexRef.current);
    setFen(gameRef.current.fen());
    setLastMadeMove(history[currentMoveIndexRef.current]);

    if (currentMoveIndexRef.current < history.length - 1) {
      setTimeout(() => playNextMove(), 1000);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentMoveIndex(currentMoveIndexRef.current);
    }
  }, [history]);

  const playMove = useCallback(() => {
    if (
      !isPlayingRef.current &&
      currentMoveIndex < history.length - 1 &&
      history.length > 0
    ) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      currentMoveIndexRef.current = currentMoveIndex;
      playNextMove();
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentMoveIndex(currentMoveIndexRef.current);
    }
  }, [currentMoveIndex, history, playNextMove]);

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
  const boardPlayerData = (player) => {
    if (player == "white" && boardOrientation == "white")
      return whitePlayerInfo;
    else if (player == "white" && boardOrientation == "black")
      return blackPlayerInfo;
    else if (player == "black" && boardOrientation == "white")
      return blackPlayerInfo;
    else return whitePlayerInfo;
  };

  return (
    <div className="">
      <Card className="h-16 items-center p-4 m-3">
        <CardContent>
          <label className="text-2xl font-bold">chessty</label>
        </CardContent>
      </Card>
      <div className="flex flex-col lg:flex-row gap-5 lg:min-h-[calc(100vh-8rem)]">
        <div className="hidden lg:block w-[calc(14vw)] rounded-xs"></div>
        <div className="mx-1 mt-2 lg:m-3">
          <div className="hidden lg:block h-[calc(8vh)] rounded-xs"></div>
          <div className="ml-9 mb-1.5 lg:mb-2.5">
            <PlayerBoard playerInfo={boardPlayerData("black")} />
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
            <div className="lg:min-h-[calc(100vh-24rem-90px)] max-h-[calc(100vh-18rem-8px)] aspect-square overflow-visible relative">
              <ChessBoard
                fen={fen}
                bestMove={bestMove}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
              />
            </div>
          </Card>
          <div className="flex ml-9 mt-1.5 lg:mt-2.5 justify-between">
            <PlayerBoard playerInfo={boardPlayerData("white")} />
            <Button
              className="bg-[#323130] hover:bg-[#474944] mr-3 h-9 lg:h-12 lg:w-16 md:h-10 md:w-20 my-auto"
              size="lg"
              onClick={rotateBoard}
            >
              <RefreshCcw color="#adadad"></RefreshCcw>
            </Button>
          </div>
        </div>
        <div className="hidden lg:block w-[2px] bg-neutral-500 rounded-xs"></div>
        <div className="flex-1 relative lg:m-3">
          {analyzingState == 1 ? (
            <>
              {/* <div className="absolute top-0 right-0 w-[30%] h-[18%] mr-4">

              </div> */}
              <Tabs
                className="w-full h-[calc(100%-3.5rem)] md:items-center"
                defaultValue="pgn"
              >
                <div className="flex flex-row gap-3 mx-4">
                  <TabsList>
                    <TabsTrigger value="pgn">From PGN</TabsTrigger>
                    <TabsTrigger value="chesscom">chess.com</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 md:flex-0">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full font-medium bg-[#292524] text-neutral-100 border-1 hover:bg-neutral-700">
                          Engine
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select Stockfish Version</DialogTitle>
                          <DialogDescription>
                            Recommended: Stockfish-17-Lite
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Select onValueChange={handleEngineChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={`${chosen == "lite" ? "Stockfish-17-Lite" : "Stockfish-17.1-Full"}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lite">
                                Stockfish-17-Lite (default)
                              </SelectItem>
                              <SelectItem value="main">
                                Stockfish-17.1-Full (79 MB)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <TabsContent value="pgn" className="w-full p-3 h-full">
                  <PGNImport pgn={pgn} setPgn={setPgn} loadPGN={loadPGN} />
                </TabsContent>
                <TabsContent value="chesscom" className="w-full p-3 h-full">
                  <ChessComImport loadPGN={loadPGN}></ChessComImport>
                </TabsContent>
              </Tabs>
            </>
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
            <div className="flex flex-col gap-2 mx-3">
              <Card className="items-center p-1.5 rounded-md">
                <CardContent>
                  <label className="text-sm font-bold">Game Review</label>
                </CardContent>
              </Card>
              <div className="h-20 bg-[#403d39] rounded-sm overflow-hidden">
                <EvalGraph analysisData={analysis.current} />
              </div>
              <MoveType verdicts={verdicts.current} />
              <Button
                size="default"
                className="bg-lime-500 font-bold hover:bg-lime-400"
                onClick={() => setAnalyzingState(4)}
              >
                Show Moves
              </Button>
            </div>
          ) : undefined}
          {analyzingState == 4 ? (
            <div className="flex flex-col gap-2 mx-3 ">
              <Button
                size="default"
                className="bg-lime-500 font-bold md hover:bg-lime-400 border-1 relative"
                onClick={() => setAnalyzingState(3)}
              >
                <ChevronLeft
                  strokeWidth={3}
                  className="absolute left-0 mx-2 "
                ></ChevronLeft>
                Highlights
              </Button>
              <div className="h-20 bg-[#403d39] rounded-sm overflow-hidden">
                <EvalGraph analysisData={analysis.current} />
              </div>
              <MoveBox
                history={history}
                verdicts={verdicts.current}
                currMoveIndex={currentMoveIndex}
                moveClick={moveClick}
              ></MoveBox>
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
              {isPlaying ? (
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
        <div className="hidden lg:block w-[calc(12vw)] rounded-xs"></div>
      </div>
    </div>
  );
};

export default ChessAnalyzer;
