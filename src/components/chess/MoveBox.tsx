import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Star, Check } from "lucide-react";

export default function MoveBox({ verdicts }) {
  const whiteVerdicts: object = {
    bestmove: 0,
    goodmove: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
  const blackVerdicts: object = {
    bestmove: 0,
    goodmove: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
  for (let i = 0; i < verdicts.length; ++i) {
    if (i % 2 == 0) {
      whiteVerdicts[verdicts[i]]++;
    } else {
      blackVerdicts[verdicts[i]]++;
    }
  }
  console.log(whiteVerdicts);
  console.log(blackVerdicts);

  return (
    <Card className="p-0">
      <ScrollArea className="w-full">
        <div className="flex flex-col px-5 pr-2 py-3">
          <div className="grid grid-cols-[1fr_3ch_auto_3ch] gap-2">
            <p className="font-medium">Bestmove</p>
            <p className="text-[#81b64c] font-bold">{whiteVerdicts.bestmove}</p>
            <div className="size-5 bg-[#81b64c] aspect-square my-auto ml-3 mr-7 rounded-xl flex items-center justify-center">
              <Star className="w-[75%]" fill="#ffffff" />
            </div>
            <p className="text-[#81b64c] font-bold">{blackVerdicts.bestmove}</p>

            <p className="font-medium">Goodmove</p>
            <p className="text-[#8ea970] font-bold">{whiteVerdicts.goodmove}</p>
            <div className="size-5 my-auto ml-3 mr-7 bg-[#8ea970] rounded-xl flex items-center justify-center">
              <Check className="w-[75%]" color="#ffffff" strokeWidth={4} />
            </div>
            <p className="text-[#8ea970] font-bold">{blackVerdicts.goodmove}</p>

            <p className="font-medium">Inaccuracy</p>
            <p className="text-[#56b4e9] font-bold">
              {whiteVerdicts.inaccuracy}
            </p>
            {/* <Circle className="size-4.5 my-auto ml-3 mr-7" /> */}
            <div className="size-5 my-auto ml-3 mr-7 bg-[#56b4e9] rounded-xl flex items-center justify-center">
              <div className="text-[80%] font-bold">?!</div>
            </div>
            <p className="text-[#56b4e9] font-bold">
              {blackVerdicts.inaccuracy}
            </p>

            <p className="font-medium">Mistake</p>
            <p className="text-[#ffa459] font-bold">{whiteVerdicts.mistake}</p>
            {/* <Circle className="size-4.5 my-auto ml-3 mr-7" /> */}
            <div className="size-5 my-auto ml-3 mr-7 bg-[#ffa459] rounded-xl flex items-center justify-center">
              <div className="text-[80%] font-bold">?</div>
            </div>
            <p className="text-[#ffa459] font-bold">{blackVerdicts.mistake}</p>

            <p className="font-medium">Blunder</p>
            <p className="text-[#fa412d] font-bold">{whiteVerdicts.blunder}</p>
            {/* <Plus className="size-4.5 my-auto ml-3 mr-7 rotate-45" fill="#ffffff" /> */}
            <div className="size-5 my-auto ml-3 mr-7 bg-[#fa412d] rounded-xl flex items-center justify-center">
              <div className="text-[75%] font-bold">??</div>
            </div>
            <p className="text-[#fa412d] font-bold">{blackVerdicts.blunder}</p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
