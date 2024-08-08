import { ChevronDown, } from "lucide-react";
import type { DifficultyLevel, Player } from "../page";
import Image from "next/image";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";


type PlayerProps = {
  player: Player
  picPosition?: "left" | "right"
  difficulty?: DifficultyLevel
}
export default function Player({ player, picPosition = "left", difficulty }: PlayerProps) {

  return (
    <div className={`relative h-14 w-14 flex gap-2 items-start rounded-full  border border-green-400`}>
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
