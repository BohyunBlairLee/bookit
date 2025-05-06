import { Button } from "@/components/ui/button";
import { ReadingStatus } from "@shared/schema";

interface BookCardButtonGroupProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export default function BookCardButtonGroup({
  status,
  onStatusChange
}: BookCardButtonGroupProps) {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
      <Button 
        variant={status === ReadingStatus.WANT ? "secondary" : "outline"}
        onClick={() => onStatusChange(ReadingStatus.WANT)}
        className={status === ReadingStatus.WANT ? "text-white font-bold shadow-md min-w-fit" : "min-w-fit"}
      >
        읽을 예정
      </Button>
      <Button 
        variant={status === ReadingStatus.READING ? "secondary" : "outline"}
        onClick={() => onStatusChange(ReadingStatus.READING)}
        className={status === ReadingStatus.READING ? "text-white font-bold shadow-md min-w-fit" : "min-w-fit"}
      >
        읽는 중
      </Button>
      <Button 
        variant={status === ReadingStatus.COMPLETED ? "default" : "outline"}
        className={status === ReadingStatus.COMPLETED ? "bg-accent hover:bg-accent/90 text-white font-bold shadow-md min-w-fit" : "min-w-fit"}
        onClick={() => {
          onStatusChange(ReadingStatus.COMPLETED);
        }}
      >
        완독!
      </Button>
    </div>
  );
}