import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PGNImport({
  pgn,
  setPgn,
}: {
  pgn: string;
  setPgn: (pgn: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Textarea
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        placeholder="Enter your PGN here..."
      />
      <Button>Import PGN</Button>
    </div>
  );
}
