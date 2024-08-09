import { useCallback, useEffect } from 'react';
import Slider from './slider'
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DifficultyLevel } from './game';
import { GameState } from '../page';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type SplashScreenProps = {
  onStart: () => void
  onUpdate: (updates: Partial<GameState>) => void
}

export default function SplashScreen({ onStart, onUpdate }: SplashScreenProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    return params.toString()
  }, [searchParams])
  const handlePushRouter = (items: string) => {
    router.push(pathname + "?" + createQueryString("difficulty", items))
  }
  const handleCardQty = (items: string) => {
    router.push(pathname + "?" + createQueryString("cards", items))
  }

  // Set Difficulty
  useEffect(() => {
    const difficulty = searchParams.get("difficulty")
    const card = searchParams.get("cards")
    if (difficulty && card) {
      const newDifficulty = (["easy", "medium", "hard"].includes(difficulty) ? difficulty : "easy") as DifficultyLevel
      const newCards = ["10", "20"].includes(card) ? Number(card) / 2 : 10
      onUpdate({ difficulty: newDifficulty, cards: newCards })
    }
  }, [searchParams.get("difficulty"), searchParams.get("cards")])

  return (
    <div className='w-full h-screen bg-white flex justify-center items-center'>
      <div className='w-[30rem] border p-4 flex flex-col items-center gap-4'>
        <Link href="/" className='self-start'><ArrowLeft /></Link>
        <h1 className='text-3xl text-center font-bold'>Matching Card</h1>
        <div className="grid grid-cols-2 gap-2 w-full">
          <p>Choose Difficulty : </p>
          <Slider items={["easy", 'medium', 'hard']} onChange={handlePushRouter} />
          <p>Cards</p>
          <Slider items={["10", "20"]} onChange={handleCardQty} />
        </div>
        <button onClick={onStart} className='p-4 rounded-md border w-full bg-orange-500 text-white font-bold'>Play</button>
      </div>
    </div>
  )
}
