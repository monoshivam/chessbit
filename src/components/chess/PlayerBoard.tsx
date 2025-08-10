import React from "react";
import Image from "next/image";

function PlayerBoard({ playerInfo }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-1.5 lg:gap-2.5">
      <div className="h-9 lg:h-14 md:h-12 rounded-sm overflow-hidden">
        <Image
          src="/user-image.svg"
          alt="User"
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      </div>
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
