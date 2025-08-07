import { Card } from "../ui/card";
import { Timer } from "lucide-react";

export default function GameInfo({
  accuracies,
  whitePlayerInfo,
  blackPlayerInfo,
  time,
}) {
  let mins;
  if (time > 0) mins = time / 60;
  else mins = null;

  let wn = whitePlayerInfo.name;
  let bn = blackPlayerInfo.name;

  if (whitePlayerInfo.name.length > 7)
    wn = whitePlayerInfo.name.slice(0, 6) + "..";
  if (blackPlayerInfo.name.length > 7)
    bn = blackPlayerInfo.name.slice(0, 6) + "..";

  return (
    <Card className="flex flex-row items-center justify-between p-1.5 rounded-sm ">
      <div className="flex gap-1.5 mr-auto">
        <img
          src="/user-image.svg"
          alt="User"
          className="h-11 lg:h-14 md:h-12 rounded-sm"
        />
        <div className="flex flex-col gap-1 justify-around">
          <label className="font-bold text-xs">{wn}</label>
          <label className="bg-white border-1 border-black font-bold text-black text-[0.75rem] mr-auto px-2 py-0.5 rounded-sm">
            {accuracies.white}%
          </label>
        </div>
      </div>
      <div className="flex bg-[#262522] items-center p-2 py-1.5 gap-1 rounded-sm">
        <Timer size={22} />
        <div className="flex flex-col items-center">
          <label className="text-xs font-bold">{mins ? mins : "-"}</label>
          <label className="text-xs font-bold">mins</label>
        </div>
      </div>
      <div className="flex gap-1.5 ml-auto">
        <div className="flex flex-col gap-1 justify-around">
          <label className="font-bold text-xs text-wrap">{bn}</label>
          <label className="bg-black border-1 border-white font-bold text-[0.75rem] ml-auto px-2 py-0.5 rounded-sm">
            {accuracies.black}%
          </label>
        </div>
        <img
          src="/user-image.svg"
          alt="User"
          className="h-11 lg:h-14 md:h-12 rounded-sm"
        />
      </div>
    </Card>
  );
}
