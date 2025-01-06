"use client";

import React, { useState, useEffect, useCallback } from "react";
import Timer from "./Timer";
import Keyboard from "./Keyboard";
import { useIntl } from "react-intl";
import styles from "./SudokuGrid.module.css";

type PencilMarks = boolean[];

interface SudokuGridProps {
  puzzle: (number | null)[][];
}

const SudokuGrid = ({ puzzle }: SudokuGridProps) => {
  const intl = useIntl();
  const [showPencilMarks, setShowPencilMarks] = useState<boolean>(true);
  const [isPencilMode, setIsPencilMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [guesses, setGuesses] = useState<(number | null)[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );
  // const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errorCells, setErrorCells] = useState<boolean[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(false))
  );
  const [grid, setGrid] = useState<PencilMarks[][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(false))
      )
  );
  const [manualPencilMarks, setManualPencilMarks] = useState<boolean[][][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(false))
      )
  );
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Get all numbers that should be removed from pencil marks for a given cell
  const getConflictingNumbers = useCallback(
    (
      row: number,
      col: number,
      currentGuesses: (number | null)[][]
    ): Set<number> => {
      const conflicts = new Set<number>();

      // Check row
      for (let c = 0; c < 9; c++) {
        if (puzzle[row][c] !== null) conflicts.add(puzzle[row][c]!);
        if (currentGuesses[row][c] !== null)
          conflicts.add(currentGuesses[row][c]!);
      }

      // Check column
      for (let r = 0; r < 9; r++) {
        if (puzzle[r][col] !== null) conflicts.add(puzzle[r][col]!);
        if (currentGuesses[r][col] !== null)
          conflicts.add(currentGuesses[r][col]!);
      }

      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (puzzle[r][c] !== null) conflicts.add(puzzle[r][c]!);
          if (currentGuesses[r][c] !== null)
            conflicts.add(currentGuesses[r][c]!);
        }
      }

      return conflicts;
    },
    [puzzle]
  );

  // Check if a number would create a conflict in row, column, or box
  const checkForConflicts = useCallback(
    (row: number, col: number, num: number): boolean => {
      // Check row
      for (let c = 0; c < 9; c++) {
        if (c !== col) {
          if (puzzle[row][c] === num || guesses[row][c] === num) return true;
        }
      }

      // Check column
      for (let r = 0; r < 9; r++) {
        if (r !== row) {
          if (puzzle[r][col] === num || guesses[r][col] === num) return true;
        }
      }

      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (r !== row || c !== col) {
            if (puzzle[r][c] === num || guesses[r][c] === num) return true;
          }
        }
      }

      return false;
    },
    [puzzle, guesses]
  );

  // Update pencil marks for all cells
  const updateAllPencilMarks = useCallback(
    (currentGuesses: (number | null)[][]) => {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => row.map((cell) => [...cell]));

        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            // Skip if the cell has a puzzle number or guess
            if (
              puzzle[row][col] !== null ||
              currentGuesses[row][col] !== null
            ) {
              continue;
            }

            const conflicts = getConflictingNumbers(row, col, currentGuesses);

            // Only update pencil marks that haven't been manually modified
            for (let num = 1; num <= 9; num++) {
              if (!manualPencilMarks[row][col][num - 1]) {
                newGrid[row][col][num - 1] = !conflicts.has(num);
              }
            }
          }
        }

        return newGrid;
      });
    },
    [puzzle, getConflictingNumbers, manualPencilMarks]
  );

  // Update errors and completion
  const checkCompletionAndErrors = useCallback(() => {
    // Check for errors first
    let hasAnyError = false;
    const newErrorCells = Array(9)
      .fill(null)
      .map(() => Array(9).fill(false));

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (guesses[row][col] !== null) {
          const hasConflict = checkForConflicts(row, col, guesses[row][col]!);
          newErrorCells[row][col] = hasConflict;
          if (hasConflict) hasAnyError = true;
        }
      }
    }

    setErrorCells(newErrorCells);

    // Check completion only if there are no errors
    if (!hasAnyError) {
      const allCellsFilled = guesses.every((row, i) =>
        row.every((cell, j) => puzzle[i][j] !== null || cell !== null)
      );

      if (allCellsFilled) {
        setIsComplete(true);
      }
    }
  }, [guesses, puzzle, checkForConflicts]);

  // Initialize pencil marks only when component mounts or puzzle changes
  useEffect(() => {
    if (puzzle) {
      updateAllPencilMarks(guesses);
    }
  }, [puzzle, updateAllPencilMarks]);

  // Update errors and completion whenever guesses change
  useEffect(() => {
    checkCompletionAndErrors();
  }, [guesses, checkCompletionAndErrors]);

  const handleNumberInput = useCallback(
    (number: number | null) => {
      if (!selectedCell) return;
      const [row, col] = selectedCell;

      // Don't modify original puzzle numbers
      if (puzzle[row][col] !== null) return;

      if (number === null) {
        // Handle X (clear) button
        if (!isPencilMode) {
          setGuesses((prev) => {
            const newGuesses = [...prev];
            newGuesses[row] = [...newGuesses[row]];
            newGuesses[row][col] = null;
            return newGuesses;
          });
          // Update pencil marks after clearing a guess
          updateAllPencilMarks(
            guesses.map((r, i) =>
              i === row ? r.map((c, j) => (j === col ? null : c)) : [...r]
            )
          );
        }
        return;
      }

      if (isPencilMode) {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row) => row.map((cell) => [...cell]));
          newGrid[row][col][number! - 1] = !newGrid[row][col][number! - 1];
          return newGrid;
        });

        setManualPencilMarks((prev) => {
          const newManual = prev.map((row) => row.map((cell) => [...cell]));
          newManual[row][col][number! - 1] = true;
          return newManual;
        });
      } else {
        const newGuesses = guesses.map((r, i) =>
          i === row ? r.map((c, j) => (j === col ? number : c)) : [...r]
        );
        setGuesses(newGuesses);
        updateAllPencilMarks(newGuesses);
      }
    },
    [selectedCell, isPencilMode, puzzle, guesses, updateAllPencilMarks]
  );

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleNumberInput(null);
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, handleNumberInput]);

  return (
    <div className={styles.container}>
      {isComplete && (
        <div className={styles.congratulations}>
          {intl.formatMessage({ id: "game.congratulations" })}
        </div>
      )}
      <Timer isRunning={!isComplete} />
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => {
                const isSelected =
                  selectedCell?.[0] === rowIndex &&
                  selectedCell?.[1] === colIndex;
                const isError = errorCells[rowIndex][colIndex];
                const isOriginalNumber = puzzle[rowIndex][colIndex] !== null;

                const cellClasses = [
                  styles.cell,
                  isSelected ? styles.cellSelected : '',
                  isOriginalNumber ? styles.cellDisabled : styles.cellEnabled,
                  colIndex % 3 === 2 && colIndex !== 8 ? styles.cellBorderRightThick : 
                    colIndex !== 8 ? styles.cellBorderRight : '',
                  rowIndex % 3 === 2 && rowIndex !== 8 ? styles.cellBorderBottomThick :
                    rowIndex !== 8 ? styles.cellBorderBottom : ''
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cellClasses}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isOriginalNumber) {
                        setSelectedCell([rowIndex, colIndex]);
                      }
                    }}
                    tabIndex={!isOriginalNumber ? 0 : -1}
                    onKeyDown={(e) => {
                      if (
                        !isOriginalNumber &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        setSelectedCell([rowIndex, colIndex]);
                      }
                    }}
                  >
                    {isOriginalNumber ? (
                      <div className={styles.number}>
                        {puzzle[rowIndex][colIndex]}
                      </div>
                    ) : guesses[rowIndex][colIndex] !== null ? (
                      <div className={`${styles.number} ${isError ? styles.guessError : styles.guess}`}>
                        {guesses[rowIndex][colIndex]}
                      </div>
                    ) : (
                      <div className={styles.pencilGrid}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((mark) => (
                          <div
                            key={mark}
                            className={`${styles.pencilMark} ${
                              cell[mark] && showPencilMarks ? '' : styles.pencilMarkHidden
                            }`}
                          >
                            {mark + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <input
              type="checkbox"
              id="showPencilMarks"
              checked={showPencilMarks}
              onChange={(e) => setShowPencilMarks(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="showPencilMarks" className={styles.label}>
              {intl.formatMessage({ id: "game.showPencilMarks" })}
            </label>
          </div>
          <div className={styles.controlGroup}>
            <input
              type="checkbox"
              id="pencilMode"
              checked={isPencilMode}
              onChange={(e) => setIsPencilMode(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="pencilMode" className={styles.label}>
              {intl.formatMessage({ id: "game.pencilMode" })}
            </label>
          </div>
        </div>
        <Keyboard
          isPencilMode={isPencilMode}
          onNumberClick={handleNumberInput}
        />
      </div>
    </div>
  );
};

export default SudokuGrid;
