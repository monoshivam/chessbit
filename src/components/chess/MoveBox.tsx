import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export default function MoveBox({ history, verdicts, currMoveIndex }) {
  console.log(currMoveIndex);

  const moves = [];

  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = history[i]?.to || "";
    const blackMove = history[i + 1]?.to || "";

    const isEvenMove = moveNumber % 2 === 0;
    const className = isEvenMove
      ? "grid grid-cols-[1fr_1fr_1fr] bg-[#2a2926] rounded-sm py-1 mb-1.5"
      : "grid grid-cols-[1fr_1fr_1fr] py-0.3 mb-1.5";

    const firstColor =
      verdicts[i] == "blunder"
        ? "#fa412d"
        : verdicts[i] == "mistake"
          ? "#ffa459"
          : verdicts[i] == "inaccuracy"
            ? "#56b4e9"
            : verdicts[i] == "bestmove"
              ? "#81b64c"
              : "#232327";
    const secondColor =
      verdicts[i + 1] == "blunder"
        ? "#fa412d"
        : verdicts[i + 1] == "mistake"
          ? "#ffa459"
          : verdicts[i + 1] == "inaccuracy"
            ? "#56b4e9"
            : verdicts[i] == "bestmove"
              ? "#81b64c"
              : "#232327";

    moves.push(
      <div key={moveNumber} className={className}>
        <label className="ml-5 text-[0.8rem] my-auto font-bold">
          {moveNumber}.
        </label>
        <div className="w-full">
          <div
            className={`w-full flex flex-row items-start pl-2 ${i == currMoveIndex ? "bg-[#484745] rounded-md border-1" : ""}`}
          >
            {whiteMove ? (
              <div
                className={`w-[5px] h-[12px] my-auto bg-[${firstColor}] mr-1.5 rounded-sm`}
              ></div>
            ) : (
              <div className={`w-[5px] h-[12px] mr-1.5`}></div>
            )}
            <label className="font-medium text-[0.9rem] my-auto ">
              {whiteMove ? whiteMove : ""}
            </label>
          </div>
        </div>
        <div className="w-full">
          <div
            className={`w-full flex flex-row items-start pl-2 ${i + 1 == currMoveIndex ? "bg-[#484745] rounded-md border-1" : ""}`}
          >
            {blackMove ? (
              <div
                className={`w-[5px] h-[12px] my-auto bg-[${secondColor}] mr-1.5 rounded-sm`}
              ></div>
            ) : (
              <div className={`w-[5px] h-[12px] mr-1.5`}></div>
            )}
            <label className="font-medium text-[0.9rem] my-auto">
              {blackMove ? blackMove : ""}
            </label>
          </div>
        </div>
      </div>,
    );
  }

  return (
    <ScrollArea className="px-2 pt-2 rounded-sm flex flex-col bg-[#1c1917] border-1 h-[calc(100vh-22rem)]">
      <div className="w-full flex items-center justify-center bg-[#2a2926] rounded-sm py-0.5 mb-1.5">
        <label className="text-sm font-bold mb-1 ">Moves</label>
      </div>
      {moves}
    </ScrollArea>
  );
}
