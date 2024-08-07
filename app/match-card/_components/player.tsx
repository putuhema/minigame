import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Cpu, User } from "lucide-react";
import type { DifficultyLevel, Player } from "../page";
import Image from "next/image";


type PlayerProps = {
  player: Player
  picPosition?: "left" | "right"
  difficulty?: DifficultyLevel
}
export default function Player({ player, picPosition = "left", difficulty }: PlayerProps) {

  return (
    <div className={`relative flex gap-2 items-start p-2 rounded-lg border ${player.isMyTurn ? ' border-green-500' : ''}`}>
      <div className={cn(" order-1  grid place-content-center",
        picPosition === "left" && "order-1",
        picPosition === "right" && "order-2",
      )}>
        {player.name === "AI" ? <Image src={`/char/player-${player.guess === "correct" ? "happy" : player.guess === "incorrect" ? "mad" : "idle"}.png`} alt="player avatar" width={200} height={200} /> : <User />}
      </div>
      <div className={cn("flex flex-col justify-end",
        picPosition === "left" && "order-2",
        picPosition === "right" && "order-1",
      )}>
        <p className={cn("font-bold")}>{player.name} </p>
        <p className="text-sm">{difficulty}</p>
        <p>
          {player.gold}<i className="text-xs">g</i>
        </p>
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
