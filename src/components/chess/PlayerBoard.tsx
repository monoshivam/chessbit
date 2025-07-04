import { Card, CardContent } from "../ui/card";

export default function PlayerBoard({
  p1name,
  p2name,
  p1elo,
  p2elo,
}: {
  p1name: string;
  p2name: string;
  p1elo: number;
  p2elo: number;
}) {
  return (
    <div className="select-none font-bold">
      <Card className="w-full p-0 ">
        <CardContent className="grid grid-cols-[3fr_1.5fr] grid-rows-2 h-full w-full p-0">
          <div className="flex items-center justify-center border border-l-0 border-t-0 p-3 mt-2 ml-2">
            <div className="pb-1">{p1name}</div>
          </div>
          <div className="flex items-center justify-center border border-r-0 border-t-0 p-3 mt-2 mr-2 ">
            <div className="pb-1">{p1elo}</div>
          </div>
          <div className="flex items-center justify-center border border-l-0 border-b-0 mb-2 ml-2">
            <div className="pt-1">{p2name}</div>
          </div>
          <div className="flex items-center justify-center border border-r-0 border-b-0 mb-2 mr-2">
            <div className="pt-1">{p2elo}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
