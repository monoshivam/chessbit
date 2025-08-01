import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PGNImport({
  pgn,
  setPgn,
  loadPGN,
}: {
  pgn: string;
  setPgn: (pgn: string) => void;
  loadPGN: (pgn: string) => Promise<void>;
}) {
  const isDisabled = pgn.trim() === "";
  return (
    <div className="grid grid-rows-[1fr_auto] gap-2 w-full h-full">
      <Textarea
        className="resize-none font-bold h-22 lg:h-full"
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder="Enter your PGN here..."
      />
      <Button
        size="sm"
        disabled={isDisabled}
        className={
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-lime-500 font-bold"
            : "bg-lime-500 font-bold hover:bg-lime-400"
        }
        onClick={() => loadPGN(pgn)}
      >
        Analyze
      </Button>
    </div>
  );
}
