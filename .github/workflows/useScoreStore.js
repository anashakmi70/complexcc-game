import { useState, useEffect } from "react";

const defaultPlayerNames = ["Player 1", "Player 2", "Player 3", "Player 4"];
const categories = ["L6oosh", "Diamonds", "Queens", "King"];
const maxRounds = 4;
const maxGames = 2;

const createInitialData = () => {
  const data = {};
  for (let r = 1; r <= maxRounds; r++) {
    data[r] = {};
    for (let g = 1; g <= maxGames; g++) {
      data[r][g] = defaultPlayerNames.map(() =>
        categories.reduce((acc, cat) => {
          acc[cat] = { count: 0, doubled: false, playedBy: null };
          return acc;
        }, {})
      );
    }
  }
  return data;
};

export function useScoreStore() {
  const [scores, setScores] = useState(() => {
    const stored = localStorage.getItem("gameScores");
    return stored ? JSON.parse(stored) : createInitialData();
  });

  const [names, setNames] = useState(() => {
    const stored = localStorage.getItem("playerNames");
    return stored ? JSON.parse(stored) : defaultPlayerNames;
  });

  useEffect(() => {
    localStorage.setItem("gameScores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("playerNames", JSON.stringify(names));
  }, [names]);

  const resetAll = () => {
    setScores(createInitialData());
    setNames(defaultPlayerNames);
    localStorage.clear();
  };

  return { scores, setScores, names, setNames, resetAll };
}
