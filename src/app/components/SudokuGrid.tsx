"use client";

import React, { useState, useEffect, useCallback } from "react";
import Timer from "./Timer";
import Keyboard from "./Keyboard";

type PencilMarks = boolean[];

interface SudokuGridProps {
  puzzle: (number | null)[][];
}

const SudokuGrid = ({ puzzle }: SudokuGridProps) => {
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
      setGrid(() => {
        const newGrid = Array(9)
          .fill(null)
          .map(() =>
            Array(9)
              .fill(null)
              .map(() => Array(9).fill(true))
          );

        // Update each empty cell's pencil marks
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (
              puzzle[row][col] === null &&
              currentGuesses[row][col] === null
            ) {
              const conflicts = getConflictingNumbers(row, col, currentGuesses);
              for (let num = 1; num <= 9; num++) {
                newGrid[row][col][num - 1] = !conflicts.has(num);
              }
            }
          }
        }

        return newGrid;
      });
    },
    [puzzle, getConflictingNumbers]
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

  // Initialize pencil marks
  useEffect(() => {
    updateAllPencilMarks(guesses);
  }, [puzzle, updateAllPencilMarks, guesses]);

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
        setGrid((prev) =>
          prev.map((r, rowIndex) =>
            r.map((cell, colIndex) =>
              rowIndex === row && colIndex === col
                ? cell.map((value, index) =>
                    index === number - 1 ? !value : value
                  )
                : cell
            )
          )
        );
      } else {
        const newGuesses = guesses.map((r, i) =>
          i === row ? r.map((c, j) => (j === col ? number : c)) : [...r]
        );
        setGuesses(newGuesses);
        // Update pencil marks after making a guess
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {isComplete && (
        <div className="text-2xl font-bold text-green-600 mb-4">
          🎉 Congratulations! You've completed the puzzle! 🎉
        </div>
      )}
      <Timer isRunning={!isComplete} />
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="border-2 border-gray-800">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => {
                const isSelected =
                  selectedCell?.[0] === rowIndex &&
                  selectedCell?.[1] === colIndex;
                const isError = errorCells[rowIndex][colIndex];
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-12 h-12 relative
                      ${isSelected ? "bg-blue-100" : "bg-white"}
                      ${
                        colIndex % 3 === 2 && colIndex !== 8
                          ? "border-r-2 border-r-gray-800"
                          : colIndex !== 8
                          ? "border-r border-r-gray-300"
                          : ""
                      }
                      ${
                        rowIndex % 3 === 2 && rowIndex !== 8
                          ? "border-b-2 border-b-gray-800"
                          : rowIndex !== 8
                          ? "border-b border-b-gray-300"
                          : ""
                      }
                      ${
                        puzzle[rowIndex][colIndex] === null
                          ? "cursor-pointer hover:bg-blue-100"
                          : "cursor-not-allowed"
                      }
                      outline-none 
                      transition-all duration-200
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      if (puzzle[rowIndex][colIndex] === null) {
                        setSelectedCell([rowIndex, colIndex]);
                      }
                    }}
                    tabIndex={puzzle[rowIndex][colIndex] === null ? 0 : -1}
                    onKeyDown={(e) => {
                      if (
                        puzzle[rowIndex][colIndex] === null &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        setSelectedCell([rowIndex, colIndex]);
                      }
                    }}
                  >
                    {puzzle[rowIndex][colIndex] !== null ? (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-medium">
                        {puzzle[rowIndex][colIndex]}
                      </div>
                    ) : guesses[rowIndex][colIndex] !== null ? (
                      <div
                        className={`w-full h-full flex items-center justify-center text-2xl font-medium ${
                          isError ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {guesses[rowIndex][colIndex]}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-[8px] pointer-events-none">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((mark) => (
                          <div
                            key={mark}
                            className={`flex items-center justify-center
                              ${
                                cell[mark] && showPencilMarks
                                  ? "text-gray-500"
                                  : "text-transparent"
                              }
                            `}
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPencilMarks"
              checked={showPencilMarks}
              onChange={(e) => setShowPencilMarks(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showPencilMarks" className="text-lg">
              Show pencil marks
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pencilMode"
              checked={isPencilMode}
              onChange={(e) => setIsPencilMode(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="pencilMode" className="text-lg">
              Pencil mark mode
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
