import React from "react";
import Image from "next/image";

function PlayerBoard({ playerInfo }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-1.5 lg:gap-2.5">
      <Image
        src="/user-image.svg"
        alt="User"
        width={32}
        height={32}
        className="h-9 aspect-square w-full lg:h-14 md:h-12 rounded-sm overflow-hidden object-cover"
      />
      <div className="grid grid-rows-[auto_1fr] ">
        <label className="text-[12px] lg:text-[18px] md:text-[15px] font-bold">
          {playerInfo.name}
        </label>
        <label className="text-[10px] lg:text-[14px] md:text-[12px]">
          {playerInfo.elo}
        </label>
      </div>
    </div>
  );
}

export default React.memo(PlayerBoard);
