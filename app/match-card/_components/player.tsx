import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Cpu, User } from "lucide-react";


export interface Player {
  name: string;
  isMyTurn: boolean;
  points: number
  color: string;
}
type PlayerProps = {
  player: Player
  picPosition?: "left" | "right"
}
export default function Player({ player, picPosition = "left" }: PlayerProps) {

  return (
    <div className={`relative flex gap-2 items-start p-2 rounded-lg border ${player.isMyTurn ? ' border-green-500' : ''}`}>
      <div className={cn("h-10 order-1 w-10 rounded-full border grid place-content-center",
        picPosition === "left" && "order-1",
        picPosition === "right" && "order-2",
      )}>
        {player.name === "AI" ? <Cpu /> : <User />}
      </div>
      <div className={cn(
        picPosition === "left" && "order-2",
        picPosition === "right" && "order-1",
      )}>
        <p className={cn("font-bold order-1")}>{player.name}</p>
      </div>
      {
        player.isMyTurn && picPosition === "left" && (

          <div className="absolute -right-10 top-1/2 -translate-y-1/2 animate-pulse text-green-500 duration-500">
            <ChevronLeft />
          </div>
        )
      }
      {
        player.isMyTurn && picPosition === "right" &&
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 animate-pulse text-green-500 duration-500">
          <ChevronRight />
        </div>
      }
    </div>
  )
}
