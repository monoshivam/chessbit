import { Card, CardContent } from "../ui/card";

export default function PlayerBoard({ playerInfo }) {
  return (
    <div className="select-none font-bold">
      <Card className="grid grid-rows-2 w-full p-2 gap-2.5">
        <CardContent className="grid grid-cols-[3fr_1.5fr] h-full w-full bg-neutral-7=800 rounded-2xl p-2 transition-all duration-300">
          <div className="flex items-center justify-center border-neutral-60000 border-r-3">
            <div className="pb-1 font-bold ml-2">{playerInfo.black}</div>
          </div>
          <div className="flex items-center justify-center ">
            <div className="pb-1 font-bold">{playerInfo.blackElo}</div>
          </div>
        </CardContent>
        <CardContent className="grid grid-cols-[3fr_1.5fr] h-full w-full p-2 bg-white rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-center border-neutral-600 border-r-3">
            <div className="pt-1 text-black font-bold ml-2">
              {playerInfo.white}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="pt-1 text-black font-bold">
              {playerInfo.whiteElo}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
