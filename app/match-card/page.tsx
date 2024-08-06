"use client"
import * as React from "react";
import Card from "./_components/card";
import Scoreboard from "./_components/scoreboard";

const items = ["cat", "bird", "dog", "hippo", "monkey", "worm", "shark", "jellyfish", "octopus", "catfish"]

export type Item = {
  id: number,
  name: string
}

export default function Page() {
  const [selectedCards, setSelectedCards] = React.useState<Item[]>([]);
  const [matchedPairs, setMatchedPairs] = React.useState<Set<number>>(new Set());
  const [randomItems, setRandomItems] = React.useState<Item[]>([]);
  const [players, setPlayers] = React.useState({
    player1: {
      name: 'funnyValentine',
      isMyTurn: true,
      points: 0,
      color: 'blue'
    },
    player2: {
      name: 'sasha',
      isMyTurn: false,
      points: 0,
      color: 'red'
    }
  })

  React.useEffect(() => {
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    setRandomItems(shuffledItems);
  }, []);

  React.useEffect(() => {
    if (selectedCards.length === 2) {
      const [first, second] = selectedCards;
      if (first.name === second.name) {
        setMatchedPairs(prev => new Set(prev).add(first.id).add(second.id));
        setPlayers(prevState => {
          if (prevState.player1.isMyTurn) {
            return {
              ...prevState, player1: {
                ...prevState.player1,
                points: prevState.player1.points + 10
              }
            }
          } else if (prevState.player2.isMyTurn) {
            return {
              ...prevState, player2: {
                ...prevState.player2,
                points: prevState.player2.points + 10
              }
            }

          }
          return prevState
        })

      }
      if (players.player1.isMyTurn) {
        setPlayers(prev => ({
          player1: {
            ...prev.player1,
            isMyTurn: false
          },
          player2: {
            ...prev.player2,
            isMyTurn: true
          }
        }))
      } else if (players.player2.isMyTurn) {
        setPlayers(prev => ({
          player1: {
            ...prev.player1,
            isMyTurn: true
          },
          player2: {
            ...prev.player2,
            isMyTurn: false
          }
        }))
      }
      const timeoutId = setTimeout(() => {
        setSelectedCards([]);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCards]);

  const handleSelectCard = React.useCallback((item: Item) => {
    setSelectedCards(prev => {
      if (prev.length < 2 && !prev.some(card => card.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  }, []);

  const shuffleArray = React.useCallback(<T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  }, []);

  const memoizedCards = React.useMemo(() => (
    randomItems.map((item) => (
      <Card
        player={players.player1.isMyTurn ? players.player1 : players.player2}
        key={item.id}
        item={item}
        handleSelectedCard={handleSelectCard}
        isMatched={matchedPairs.has(item.id)}
        isSelected={selectedCards.some(card => card.id === item.id)}
      />
    ))
  ), [randomItems, handleSelectCard, matchedPairs, selectedCards]);

  return (
    <div className="w-full">
      <Scoreboard players={players} />
      <div className="grid grid-cols-5 gap-4 w-full">
        {memoizedCards}
      </div>
    </div>
  );
}

