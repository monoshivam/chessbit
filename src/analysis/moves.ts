type AnalysisResult = {
  eval: number;
  moves: string;
  fen: string;
  winChance: number;
  continuationArr: string[][];
  mate: number | null;
  centipawns: number | null;
};

const evalWinninChances = (turn: string, ev: AnalysisResult): number => {
  const chance = ev.winChance;
  // console.log(chance);
  const finalChances = turn == "b" ? chance : -chance;
  return finalChances;
};

export const verdict = (
  turn: string,
  currMove: AnalysisResult,
  prevMove: AnalysisResult,
): string => {
  console.log("PREV: ", prevMove.winChance);
  console.log("CURR: ", currMove.winChance);

  if (turn == "b" && currMove.winChance == 0 && prevMove.winChance != 0) {
    return "blunder";
  } else if (
    turn == "w" &&
    currMove.winChance == 100 &&
    prevMove.winChance != 100
  ) {
    return "blunder";
  }

  const shift =
    evalWinninChances(turn, prevMove) - evalWinninChances(turn, currMove);
  // console.log(shift);
  //
  if (shift > 19) return "blunder";
  else if (shift >= 11) return "mistake";
  else if (shift > 6) return "inaccuracy";
  else return "goodmove";
};
