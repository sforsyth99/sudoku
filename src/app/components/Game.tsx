"use client";

import { useState } from "react";
import { useIntl } from "react-intl";
import SudokuGrid from "./SudokuGrid";
import { usePuzzle, useSolvePuzzle } from "../hooks/usePuzzle";
import styles from "./Game.module.css";

type Difficulty = "easy" | "medium" | "hard";

export default function Game() {
  const intl = useIntl();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const {
    data: puzzle,
    isLoading,
    refetch: fetchNewPuzzle,
  } = usePuzzle(difficulty);

  const { mutate: solvePuzzle, isPending: solving } = useSolvePuzzle();

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div>{intl.formatMessage({ id: "game.loading" })}</div>
      ) : (
        <>
          <SudokuGrid puzzle={puzzle || []} />
          <div className={styles.controls}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={styles.select}
              disabled={solving}
            >
              <option value="easy">
                {intl.formatMessage({ id: "game.difficulty.easy" })}
              </option>
              <option value="medium">
                {intl.formatMessage({ id: "game.difficulty.medium" })}
              </option>
              <option value="hard">
                {intl.formatMessage({ id: "game.difficulty.hard" })}
              </option>
            </select>
            <button
              onClick={() => fetchNewPuzzle()}
              className={styles.button}
              disabled={solving}
            >
              {intl.formatMessage({ id: "game.newPuzzle" })}
            </button>
            <button
              onClick={() => puzzle && solvePuzzle(puzzle)}
              className={styles.button}
              disabled={solving || !puzzle}
            >
              {intl.formatMessage({
                id: solving ? "game.solving" : "game.solve",
              })}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
