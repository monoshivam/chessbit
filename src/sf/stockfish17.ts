type AnalysisOptions = {
  positions: string[];
  variants?: number;
  threads?: number;
  depth?: number;
  onProgress?: (
    completed: number,
    total: number,
    currentResult: AnalysisResult,
  ) => void;
};
type AnalysisResult = {
  eval: number;
  moves: string;
  fen: string;
  winChance: number;
  continuationArr: string[][];
  mate: number | null;
  centipawns: number | null;
};
type BatchAnalysisResult = {
  results: AnalysisResult[];
  completed: number;
  total: number;
};

const analyzePosition = async (
  worker: Worker,
  variants: number,
  fen: string,
  depth: number,
): Promise<AnalysisResult> => {
  return new Promise((resolve, reject) => {
    const result: AnalysisResult = {
      eval: 0,
      moves: "",
      fen,
      winChance: 0,
      continuationArr: Array.from({ length: variants }, () => []),
      mate: null,
      centipawns: null,
    };

    let centipawns: number | null = null;

    worker.onmessage = (e) => {
      const message = e.data;
      console.log(message);

      if (message.data.startsWith("info depth")) {
        const cpMatch = message.data.match(/cp (-?\d+)/);
        const mateMatch = message.data.match(/mate (-?\d+)/);
        const multipvMatch = message.data.match(/multipv (\d+)/);
        const pvMatch = message.data.match(/ pv (.+)$/);

        const moves = pvMatch ? pvMatch[1].split(" ") : [];

        result.continuationArr[parseInt(multipvMatch[1]) - 1] = moves;
        console.log(pvMatch);
        console.log(moves);
        console.log(result.continuationArr);

        if (parseInt(multipvMatch[1]) === 1) {
          if (cpMatch) {
            centipawns = parseInt(cpMatch[1], 10);
            result.eval = centipawns / 100;
            result.centipawns = centipawns;
          } else if (mateMatch) {
            result.mate = parseInt(mateMatch[1]);
            result.centipawns = null;
          }
        }

        result.moves = result.continuationArr
          .slice(0, variants)
          .map((variant) => variant[0] || "")
          .join(" ");
        if (centipawns !== null) {
          result.winChance = calculateWinChance(centipawns);
        }
      }
      if (message.data.startsWith(`info depth ${depth}`)) {
        resolve(result);
      }
    };
    worker.onerror = (error) => {
      reject(new Error(`Stockfish analysis error: ${error.message}`));
    };
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
};

const initializeWorker = async (
  worker: Worker,
  threads: number,
  variants: number,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const message = e.data;
      console.log(message);

      if (message.type === "ready") {
        console.log("Engine Loaded");
        worker.postMessage("uci");
        worker.postMessage("isready");
      } else if (message.data === "uciok") {
        console.log("uciok");
      } else if (message.data === "readyok") {
        worker.postMessage(`setoption name Threads value ${threads}`);
        worker.postMessage(`setoption name MultiPv value ${variants}`);
        worker.postMessage(`ucinewgame`);
        console.log("stockfish options configured");
        worker.postMessage(`isready`);
        resolve();
      }
    };

    worker.onerror = (error) => {
      console.log(error);
      reject(new Error(`Worker initialization error: ${error}`));
    };

    worker.postMessage({
      type: "load-engine",
    });
  });
};

export const analyzePositions = async (
  options: AnalysisOptions,
): Promise<BatchAnalysisResult> => {
  const {
    positions,
    variants = 1,
    threads = navigator.hardwareConcurrency,
    depth = 12,
    onProgress,
  } = options;

  const results: AnalysisResult[] = [];
  const total = positions.length;
  let completed = 0;

  const worker = new Worker(`/stockfish/stockfishWorker.js`, {
    type: "module",
  });

  try {
    await initializeWorker(worker, threads, variants);

    for (const fen of positions) {
      const result = await analyzePosition(worker, variants, fen, depth);

      results.push(result);
      completed++;

      if (onProgress) {
        onProgress(completed, total, result);
      }
    }
    return {
      results,
      completed,
      total,
    };
  } catch (error) {
    console.error(error);
    return {
      results: [],
      completed,
      total,
    };
  } finally {
    worker.terminate();
  }
};

const calculateWinChance = (centipawns: number): number => {
  const winChance = 100 / (1 + Math.exp(-0.00368208 * centipawns));
  return winChance;
};
