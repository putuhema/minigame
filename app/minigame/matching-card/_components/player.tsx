import { ChevronDown, } from "lucide-react";
import type { DifficultyLevel, Player } from "./game";
import Image from "next/image";
import { cn } from "@/lib/utils";


type PlayerProps = {
  player: Player
  picPosition?: "left" | "right"
}
export default function Player({ player }: PlayerProps) {

  return (
    <div className={`relative h-14 w-14 flex gap-2 items-start rounded-full`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-white border border-green-300">
        <Image className={cn("transform pt-1", player.role === "player" && "scale-x-[-1]")} src={`/char/profile-${player.role}.png`} width={100} height={100} alt={player.name} />
      </div>
      {
        player.isMyTurn && (
          <div className="absolute left-0 -top-8 transform   animate-bounce text-green-500 duration-500">
            <ChevronDown className="w-10 h-10" />
          </div>
        )
      }

    </div>
  )
}
