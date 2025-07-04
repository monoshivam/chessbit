import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PGNImport({
  pgn,
  setPgn,
}: {
  pgn: string;
  setPgn: (pgn: string) => void;
}) {
  const isDisabled = pgn.trim() === "";
  return (
    <div className="w-full flex items-center justify-center h-full max-h-full">
      <div className="grid grid-rows-[1fr_auto] gap-3 h-full w-full max-w-md mx-auto">
        <Textarea
          className="resize-none font-bold"
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="Enter your PGN here..."
        />
        <Button
          size="lg"
          disabled={isDisabled}
          className={
            isDisabled
              ? "opacity-50 cursor-not-allowed bg-lime-500 font-bold"
              : "bg-lime-500 font-bold hover:bg-lime-400"
          }
        >
          Analyze
        </Button>
      </div>
    </div>
  );
}
