export default function PlayerBoard({ playerInfo }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-1.5 lg:gap-2.5">
      <img
        src="/user-image.svg"
        alt="User"
        className="h-9 lg:h-14 md:h-12 rounded-sm"
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
