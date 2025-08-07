// this calculates the game accuracies based on the logic by lichess
// here: https://github.com/lichess-org/lila/blob/5cc8d8bdf408a3bbf642547e62d59038d376a61f/modules/analyse/src/main/AccuracyPercent.scala

type Color = "white" | "black";
type MoveData = {
  winChance: number;
};
type WeightedAccuracy = {
  accuracy: number;
  weight: number;
  color: Color;
};

const maths = {
  standardDeviation(data: number[]): number {
    if (data.length < 2) {
      return 0;
    }
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance =
      data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (data.length - 1);
    return Math.sqrt(variance);
  },

  weightedMean(data: [number, number][]): number {
    let totalValue = 0;
    let totalWeight = 0;
    for (const [value, weight] of data) {
      totalValue += value * weight;
      totalWeight += weight;
    }
    return totalWeight === 0 ? 0 : totalValue / totalWeight;
  },

  harmonicMean(data: number[]): number {
    if (data.length === 0) {
      return 0;
    }
    const sumOfReciprocals = data.reduce(
      (sum, val) => sum + (val === 0 ? Infinity : 1 / val),
      0,
    );
    return data.length / sumOfReciprocals;
  },

  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  },
};

function winPercentErrorToAccuracy(error: number): number {
  const accuracy = 103.1668 * Math.exp(-0.04354 * error) - 3.1668;
  return maths.clamp(accuracy, 0, 100);
}

export function calculateGameAccuracy(
  movesData: MoveData[],
): { white: number; black: number } | null {
  // The input array includes the starting position, so there is one more item than moves.
  if (movesData.length < 2) {
    return null;
  }

  // 1. Extract the numerical win percentages from the input objects.
  const allWinPercents = movesData.map((move) => move.winChance);
  const numMoves = allWinPercents.length - 1;

  // 2. Calculate Move Weights based on position volatility
  const windowSize = maths.clamp(Math.floor(numMoves / 10), 2, 8);

  // Create sliding windows to measure volatility
  const windows: number[][] = [];
  // Pad the start to ensure early moves have weights, mimicking the Scala `fill` logic
  for (let i = 0; i < Math.max(0, windowSize - 2); i++) {
    windows.push(allWinPercents.slice(0, windowSize));
  }
  // Create the rest of the sliding windows
  for (let i = 0; i <= allWinPercents.length - windowSize; i++) {
    windows.push(allWinPercents.slice(i, i + windowSize));
  }

  const weights = windows.map((winPctsInWindow) => {
    // Input is already 0-100, so no need to scale by 100 for std dev
    const stdDev = maths.standardDeviation(winPctsInWindow);
    return maths.clamp(stdDev, 0.5, 12);
  });

  // 3. Calculate Per-Move Accuracy
  const weightedAccuracies: WeightedAccuracy[] = [];
  for (let i = 0; i < numMoves; i++) {
    const prevWp = allWinPercents[i];
    const nextWp = allWinPercents[i + 1];
    const weight = weights[i] ?? 0.5; // Use a default low weight if none is available

    // Determine whose turn it was for the i-th move. Assumes White starts (i=0 is White).
    const color: Color = i % 2 === 0 ? "white" : "black";

    // Calculate the loss in win percentage from the perspective of the player who moved
    let winPctError: number;
    if (color === "white") {
      // White's error is the drop in their own win percentage
      winPctError = prevWp - nextWp;
    } else {
      // It's black's turn
      // Black's win% is (100 - White's win%). So Black's error is the drop in that value.
      // (100 - prevWp) - (100 - nextWp) simplifies to nextWp - prevWp
      winPctError = nextWp - prevWp;
    }
    winPctError = Math.max(0, winPctError); // Error cannot be negative (a gain is 0 error)

    const accuracy = winPercentErrorToAccuracy(winPctError);

    weightedAccuracies.push({ accuracy, weight, color });
  }

  // 4. Calculate Final Accuracy for each color by combining two different means
  const calculateFinalAccuracyFor = (color: Color): number => {
    const colorAccuracies = weightedAccuracies.filter(
      (wa) => wa.color === color,
    );
    if (colorAccuracies.length === 0) return 100; // No moves for this color means perfect accuracy

    const weightedMean = maths.weightedMean(
      colorAccuracies.map((wa) => [wa.accuracy, wa.weight]),
    );

    const harmonicMean = maths.harmonicMean(
      colorAccuracies.map((wa) => wa.accuracy),
    );

    // The final accuracy is the average of the two means
    return (weightedMean + harmonicMean) / 2;
  };

  const whiteAccuracy = calculateFinalAccuracyFor("white");
  const blackAccuracy = calculateFinalAccuracyFor("black");

  return {
    white: Math.round(whiteAccuracy),
    black: Math.round(blackAccuracy),
  };
}
