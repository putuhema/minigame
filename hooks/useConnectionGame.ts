import { useState, useMemo, useEffect } from "react";
import { useAnimation } from "framer-motion";
import type {
  Group,
  GameState,
} from "@/app/minigame/connection/_components/connection";
import toast from "react-hot-toast";

export default function useConnectionGame(groups: Group[]) {
  const [gameState, setGameState] = useState<GameState>({
    card: [],
    currentGuess: [],
    mistakesRemaining: 4,
    previousGuess: [],
    answer: [],
    disabledSubmit: false,
    isWrong: false,
    foundCorrect: false,
  });

  const shuffleArray = useMemo(
    () =>
      <T>(array: T[]): T[] => {
        return [...array].sort(() => Math.random() - 0.5);
      },
    []
  );

  useEffect(() => {
    const newCard = shuffleArray(groups.flatMap((g) => g.answer));
    setGameState((prev) => ({ ...prev, card: newCard }));
  }, [shuffleArray]);

  function handleOnSuffle() {
    const newCard = shuffleArray(gameState.card);
    setGameState((prev) => ({ ...prev, card: newCard }));
  }

  function handleOnPick(pickedWord: string) {
    const { currentGuess, previousGuess, disabledSubmit } = gameState;
    const isInCurrentGuess = currentGuess.includes(pickedWord);
    const isInPreviousGuess = previousGuess.flat().includes(pickedWord);
    setGameState({ ...gameState, isWrong: false, foundCorrect: false });
    if (disabledSubmit && isInPreviousGuess) {
      setGameState({ ...gameState, disabledSubmit: false });
    }
    if (currentGuess.length < 4 || isInCurrentGuess) {
      setGameState((prevGameState) => ({
        ...prevGameState,
        currentGuess: prevGameState.currentGuess.includes(pickedWord)
          ? prevGameState.currentGuess.filter((card) => card != pickedWord)
          : [...prevGameState.currentGuess, pickedWord],
      }));
    }
  }

  function isElementEqual<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }
    const sortedArray1 = [...array1.sort()];
    const sortedArray2 = [...array2.sort()];

    for (let i = 0; i < sortedArray1.length; i++) {
      if (sortedArray1[i] !== sortedArray2[i]) {
        return false;
      }
    }
    return true;
  }

  function checkIfIsInPrevGuess() {
    for (let i = 0; i < gameState.previousGuess.length; i++) {
      if (isElementEqual(gameState.previousGuess[i], gameState.currentGuess)) {
        return false;
      }
    }
    return true;
  }

  const controls = useAnimation();
  function handleSubmit() {
    if (!checkIfIsInPrevGuess()) {
      setGameState((prevGameState) => ({
        ...prevGameState,
        disabledSubmit: true,
      }));
      toast("Already Guessed.");
      return;
    }

    let foundCorrectAnswer = false;
    let newMistakesRemaining = gameState.mistakesRemaining;
    const updatedAnswer = [...gameState.answer];

    for (let i = 0; i < groups.length; i++) {
      if (isElementEqual(groups[i].answer, gameState.currentGuess)) {
        updatedAnswer.push(groups[i]);
        foundCorrectAnswer = true;
        break;
      }
    }

    if (foundCorrectAnswer) {
      const flattenedAnswer = updatedAnswer.map((a) => a.answer).flat();
      const filteredCard = gameState.card.filter(
        (word) => !flattenedAnswer.includes(word)
      );

      controls.start("jumpy").then(() => {
        setGameState((prevGameState) => ({
          ...prevGameState,
          card: filteredCard,
          previousGuess: [],
          currentGuess: [],
          answer: updatedAnswer,
          foundCorrect: true,
        }));
      });
    } else {
      let previousGuess: Array<string[]> = [];
      newMistakesRemaining -= 1;
      if (newMistakesRemaining > 0) {
        previousGuess = [...gameState.previousGuess, gameState.currentGuess];
      } else {
        previousGuess = [];
      }

      setGameState((prevGameState) => ({
        ...prevGameState,
        previousGuess,
        isWrong: true,
        disabledSubmit: true,
        mistakesRemaining: newMistakesRemaining,
      }));
    }
  }

  function handleDeselectAll() {
    setGameState((prevGameState) => ({
      ...prevGameState,
      currentGuess: [],
    }));
  }

  function handleResetGameState() {
    const newCard = shuffleArray(groups.flatMap((g) => g.answer));
    setGameState({
      answer: [],
      card: newCard,
      currentGuess: [],
      disabledSubmit: false,
      isWrong: false,
      mistakesRemaining: 4,
      previousGuess: [],
      foundCorrect: false,
    });
  }

  return {
    controls,
    gameState,
    handleOnPick,
    handleOnSuffle,
    handleSubmit,
    handleDeselectAll,
    handleResetGameState,
  };
}
