"use client"

import { format } from "date-fns"
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import toast, { Toaster } from 'react-hot-toast'
import { motion, useAnimation } from 'framer-motion'
import { CircleHelp, Settings } from 'lucide-react'
import Card from "./card"

enum Difficulty {
  Straighforward,
  Moderate,
  Challenging,
  Tricky
}
type Group = {
  name: string;
  answer: Array<string>
  difficulty: Difficulty;
}

const DIFFICULTY_COLOR = [{
  level: "straightforward",
  color: "bg-yellow-300"
},
{
  level: "moderate",
  color: "bg-green-300"
},
{
  level: "challenging",
  color: "bg-blue-300"
},
{
  level: "tricky",
  color: "bg-purple-300"
},
]

const GROUPS: Group[] = [
  {
    name: "homophones",
    answer: ["to", "too", "two", "tue"],
    difficulty: Difficulty.Straighforward
  },
  {
    name: "place down",
    answer: ["laid", "placed", "put", "sat"],
    difficulty: Difficulty.Moderate
  },
  {
    name: "___flower",
    answer: ["may", "sun", "wall", "wild"],
    difficulty: Difficulty.Challenging
  },
  {
    name: "connect",
    answer: ["couple", "tie", "unite", "wed"],
    difficulty: Difficulty.Tricky
  }
]

type GameState = {
  card: Array<string>;
  currentGuess: Array<string>;
  mistakesRemaining: number;
  previousGuess: Array<Array<string>>;
  answer: Array<Group>;
  disabledSubmit: boolean;
  isWrong: boolean;
  foundCorrect: boolean;
}

function useConnectionGame() {
  const [gameState, setGameState] = useState<GameState>({
    card: [],
    currentGuess: [],
    mistakesRemaining: 4,
    previousGuess: [],
    answer: [],
    disabledSubmit: false,
    isWrong: false,
    foundCorrect: false,
  })

  const shuffleArray = useMemo(() => <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    const newCard = shuffleArray(GROUPS.flatMap(g => g.answer));
    setGameState(prev => ({ ...prev, card: newCard }));
  }, [shuffleArray]);

  function handleOnSuffle() {
    const newCard = shuffleArray(gameState.card)
    setGameState(prev => ({ ...prev, card: newCard }))
  }

  function handleOnPick(pickedWord: string) {
    const { currentGuess, previousGuess, disabledSubmit } = gameState;
    const isInCurrentGuess = currentGuess.includes(pickedWord)
    const isInPreviousGuess = previousGuess.flat().includes(pickedWord)
    setGameState({ ...gameState, isWrong: false, foundCorrect: false })
    if (disabledSubmit && isInPreviousGuess) {
      setGameState({ ...gameState, disabledSubmit: false })
    }
    if (currentGuess.length < 4 || isInCurrentGuess) {
      setGameState(prevGameState => ({
        ...prevGameState,
        currentGuess: prevGameState.currentGuess.includes(pickedWord) ?
          prevGameState.currentGuess.filter(card => card != pickedWord) : [...prevGameState.currentGuess, pickedWord]
      }))
    }
  }

  function isElementEqual<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
      return false
    }
    const sortedArray1 = [...array1.sort()]
    const sortedArray2 = [...array2.sort()]

    for (let i = 0; i < sortedArray1.length; i++) {
      if (sortedArray1[i] !== sortedArray2[i]) {
        return false
      }
    }
    return true
  }

  function checkIfIsInPrevGuess() {
    for (let i = 0; i < gameState.previousGuess.length; i++) {
      if (isElementEqual(gameState.previousGuess[i], gameState.currentGuess)) {
        return false
      }
    }
    return true
  }

  const controls = useAnimation()
  function handleSubmit() {
    if (!checkIfIsInPrevGuess()) {
      setGameState(prevGameState => ({
        ...prevGameState,
        disabledSubmit: true
      }))
      toast("Already Guessed.")
      return
    }

    let foundCorrectAnswer = false;
    let newMistakesRemaining = gameState.mistakesRemaining
    const updatedAnswer = [...gameState.answer]

    for (let i = 0; i < GROUPS.length; i++) {
      if (isElementEqual(GROUPS[i].answer, gameState.currentGuess)) {
        updatedAnswer.push(GROUPS[i])
        foundCorrectAnswer = true;
        break;
      }
    }

    if (foundCorrectAnswer) {
      const flattenedAnswer = updatedAnswer.map(a => a.answer).flat()
      const filteredCard = gameState.card.filter(word => !flattenedAnswer.includes(word))

      controls.start("jumpy").then(() => {
        setGameState(prevGameState => ({
          ...prevGameState,
          card: filteredCard,
          previousGuess: [],
          currentGuess: [],
          answer: updatedAnswer,
          foundCorrect: true,
        }))
      })

    } else {
      let previousGuess: Array<string[]> = []
      newMistakesRemaining -= 1
      if (newMistakesRemaining > 0) {
        previousGuess = [...gameState.previousGuess, gameState.currentGuess]
      } else {
        previousGuess = []
      }

      setGameState(prevGameState => ({
        ...prevGameState,
        previousGuess,
        isWrong: true,
        disabledSubmit: true,
        mistakesRemaining: newMistakesRemaining
      }))
    }

  }

  function handleDeselectAll() {
    setGameState(prevGameState => ({
      ...prevGameState,
      currentGuess: []
    }))
  }

  function handleResetGameState() {
    const newCard = shuffleArray(GROUPS.flatMap(g => g.answer));
    setGameState({
      answer: [],
      card: newCard,
      currentGuess: [],
      disabledSubmit: false,
      isWrong: false,
      mistakesRemaining: 4,
      previousGuess: [],
      foundCorrect: false
    })
  }

  return {
    controls,
    gameState,
    handleOnPick,
    handleOnSuffle,
    handleSubmit,
    handleDeselectAll,
    handleResetGameState,
  }
}

const ANIMATION_CONFIG = {
  DURATION: 0.08,
  STAGGER_DELAY: 0.05,
  FADE_DURATION: 1,
  FADE_DELAY: 2
}

const itemVariants = {
  initial: {
    y: 0,
    opacity: 1
  },
  jumpy: {
    y: [0, -5, 5, -5, 0],
  },
  fadeOutAndShake: {
    opacity: [1, 0.5, 0.5, 1],
    x: [0, 5, -5, 5, 0],
  }
};

const containerVariants = {
  jumpy: {
    transition: {
      staggerChildren: ANIMATION_CONFIG.STAGGER_DELAY,
      delayChildren: 0.3,
      x: {
        duration: ANIMATION_CONFIG.FADE_DURATION
      },
      opacity: {
        times: [0, 0.2, 0.8, 1],
        duration: ANIMATION_CONFIG.FADE_DURATION + ANIMATION_CONFIG.FADE_DELAY
      },
      y: {
        type: 'spring',
        stiffness: 200,
        damping: 10,
        duration: ANIMATION_CONFIG.DURATION,
      },
    },
  }
};


export default function Connection() {
  const {
    gameState,
    handleOnPick,
    handleOnSuffle,
    handleSubmit,
    handleDeselectAll,
    handleResetGameState,
    controls
  } = useConnectionGame()

  useEffect(() => {
    const animateSequence = async () => {
      if (gameState.isWrong) {
        await controls.start('jumpy');
        await controls.start('fadeOutAndShake');
      } else {
        await controls.start('initial');
      }
    };
    animateSequence();
  }, [gameState.isWrong, gameState.foundCorrect, controls]);


  return (
    <>
      <div className='mt-24 p-8'>
        <h1 className='text-4xl font-bold'>Connections</h1>
        <p>{format(Date(), "PP")}</p>
        <div className='border-y py-2 flex justify-end gap-2 items-center'>
          <Settings />
          <CircleHelp />
        </div>
        <div className="xl:max-w-4xl mx-auto py-4 pt-10 space-y-5">
          <p className='text-center mb-6'>Create four groups of four!</p>
          <div className='space-y-2'>

            <motion.div
              variants={containerVariants}
              initial='initial'
              animate={controls}
              className='grid grid-cols-4 gap-2'>
              {
                gameState.answer.map(a => (
                  <motion.div
                    layout
                    key={a.name}
                    animate={
                      {
                        scale: [1, 1.04, 1],
                      }
                    }
                    transition={
                      {
                        duration: 0.5,
                      }
                    }
                    className={cn(DIFFICULTY_COLOR[a.difficulty].color,
                      "col-span-4 rounded-md p-4 text-center",)}
                  >
                    <p className='font-bold uppercase'>{a.name}</p>
                    <div className='flex justify-center gap-1 text-xl'>
                      {
                        a.answer.map((an, i) => i === a.answer.length - 1 ? (
                          <p key={an} className='uppercase'>{an}</p>
                        ) :
                          <p key={an} className='uppercase'>{an},</p>
                        )
                      }
                    </div>
                  </motion.div>
                ))
              }
              {
                gameState.card.map((text) => {
                  const isPick = gameState.currentGuess.includes(text)
                  return (
                    <Card
                      variants={isPick ? itemVariants : {}}
                      text={text}
                      key={text}
                      isPick={isPick}
                      onPick={() => { handleOnPick(text) }} />
                  )
                }
                )
              }
            </motion.div>
          </div>

          <div className='flex gap-4 items-center justify-center'>
            <p>Mistakes Remaining:</p>
            <div className='flex items-center gap-1'>
              {
                Array(gameState.mistakesRemaining).fill(0).map((_, i) =>
                  <div key={i} className='h-4 w-4 rounded-full bg-stone-600'></div>
                )
              }
            </div>
          </div>

          <div className='flex gap-4 items-center  justify-center'>
            <Button
              className='rounded-full'
              variant="outline"
              onClick={handleOnSuffle} >Suffle</Button>
            <Button
              className='rounded-full'
              disabled={gameState.currentGuess.length === 0}
              variant="outline"
              onClick={handleDeselectAll}>Deselect All</Button>
            <Button
              className='rounded-full'
              variant="outline"
              onClick={handleResetGameState}>Reset</Button>
            <Button
              className='rounded-full'
              disabled={
                gameState.currentGuess.length !== 4 ||
                gameState.mistakesRemaining === 0 ||
                gameState.disabledSubmit
              }
              variant="outline"
              onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
        <Toaster toastOptions={{
          className: '',
          style: {
            background: '#000000',
            color: '#ffffff',
            borderRadius: '4px'
          }
        }} />
      </div>
    </>
  )
}