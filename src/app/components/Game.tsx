"use client";

import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import SudokuGrid from "./SudokuGrid";
import styles from "./Game.module.css";

type Difficulty = "easy" | "medium" | "hard";

export default function Game() {
  const intl = useIntl();
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const fetchNewPuzzle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/puzzle?difficulty=${difficulty}`);
      const data = await response.json();
      setPuzzle(data.puzzle);
    } catch (error) {
      console.error("Error fetching puzzle:", error);
    }
    setLoading(false);
  };

  const solvePuzzle = async () => {
    setSolving(true);
    try {
      const response = await fetch("/api/puzzle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ puzzle }),
      });
      const data = await response.json();
      setPuzzle(data.solution);
    } catch (error) {
      console.error("Error solving puzzle:", error);
    }
    setSolving(false);
  };

  useEffect(() => {
    fetchNewPuzzle();
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <div>{intl.formatMessage({ id: "game.loading" })}</div>
      ) : (
        <>
          <div className={styles.controls}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={styles.select}
              disabled={solving}
            >
              <option value="easy">{intl.formatMessage({ id: "game.difficulty.easy" })}</option>
              <option value="medium">{intl.formatMessage({ id: "game.difficulty.medium" })}</option>
              <option value="hard">{intl.formatMessage({ id: "game.difficulty.hard" })}</option>
            </select>
          </div>
          <SudokuGrid puzzle={puzzle} />
          <div className={styles.controls}>
            <button
              onClick={fetchNewPuzzle}
              className={styles.button}
              disabled={solving}
            >
              {intl.formatMessage({ id: "game.newPuzzle" })}
            </button>
            <button
              onClick={solvePuzzle}
              className={styles.button}
              disabled={solving}
            >
              {intl.formatMessage({ 
                id: solving ? "game.solving" : "game.solve"
              })}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
