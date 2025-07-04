import { Card } from "../ui/card";

export default function BotChat({ chesstychat }) {
  return (
    <div className="select-none">
      <Card className="grid grid-rows-[auto_1fr] p-0">
        <label className="flex items-center justify-around border-b-3 pt-4 pb-4 font-bold">
          chessty assistant
        </label>
        <div className="border-white border-2 p-3 m-5 rounded-lg font-light">
          {chesstychat}
        </div>
      </Card>
    </div>
  );
}
