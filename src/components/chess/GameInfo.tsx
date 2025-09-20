import React from "react";
import { Card } from "../ui/card";
import { Timer } from "lucide-react";
import Image from "next/image";

function GameInfo({ accuracies, whitePlayerInfo, blackPlayerInfo, time }) {
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
    <Card className="flex flex-row items-center justify-between md:justify-around p-1.5 rounded-sm ">
      <div className="flex gap-1.5">
        <Image
          src="/user-image.svg"
          alt="User"
          width={56}
          height={56}
          className="w-auto h-11 lg:h-14 md:h-12 rounded-sm overflow-hidden"
        />
        <div className="flex flex-col gap-1 justify-around">
          <label className="font-bold text-xs lg:text-sm">{wn}</label>
          <label className="bg-white border-1 border-black font-bold text-black text-[0.75rem] lg:text-[1rem] mr-auto px-2 py-0.5 rounded-sm">
            {accuracies.white}%
          </label>
        </div>
      </div>
      <div className="flex bg-[#262522] items-center px-2 py-1.5 gap-1 lg:gap-2 rounded-sm h-full">
        <Timer className="size-6 lg:size-8" />
        <div className="flex flex-col items-center lg:gap-0.5">
          <label className="text-xs lg:text-sm font-bold">
            {mins ? mins : "-"}
          </label>
          <label className="text-xs lg:text-sm font-bold">mins</label>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1 justify-around">
          <label className="font-bold text-xs text-wrap lg:text-sm">{bn}</label>
          <label className="bg-black border-1 border-white font-bold text-[0.75rem] lg:text-[1rem] ml-auto px-2 py-0.5 rounded-sm">
            {accuracies.black}%
          </label>
        </div>
        <Image
          src="/user-image.svg"
          alt="User"
          width={56}
          height={56}
          className="w-auto h-11 lg:h-14 md:h-12 rounded-sm overflow-hidden"
        />
      </div>
    </Card>
  );
}

export default React.memo(GameInfo);
