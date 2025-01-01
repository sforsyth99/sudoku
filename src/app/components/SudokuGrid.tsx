"use client";

import React, { useState, useEffect, useCallback } from "react";
import Timer from "./Timer";
import Keyboard from "./Keyboard";

type PencilMarks = boolean[];

interface SudokuGridProps {
  puzzle: (number | null)[][];
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ puzzle }) => {
  const [showPencilMarks, setShowPencilMarks] = useState(true);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [grid, setGrid] = useState<PencilMarks[][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(true))
      )
  );

  // Get all numbers that should be removed from pencil marks for a given cell
  const getConflictingNumbers = useCallback((row: number, col: number): Set<number> => {
    const conflicts = new Set<number>();

    // Check row
    puzzle[row].forEach((num) => {
      if (num !== null) conflicts.add(num);
    });

    // Check column
    puzzle.forEach((r) => {
      if (r[col] !== null) conflicts.add(r[col]!);
    });

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const num = puzzle[boxRow + i][boxCol + j];
        if (num !== null) conflicts.add(num);
      }
    }

    return conflicts;
  }, [puzzle]);

  // Initialize pencil marks based on the puzzle
  useEffect(() => {
    const newGrid = Array(9)
      .fill(null)
      .map((_, row) =>
        Array(9)
          .fill(null)
          .map((_, col) => {
            if (puzzle[row][col] !== null) {
              // If cell has a number, no pencil marks
              return Array(9).fill(false);
            } else {
              // If cell is empty, show all numbers except those that conflict
              const conflicts = getConflictingNumbers(row, col);
              return Array(9)
                .fill(true)
                .map((_, i) => !conflicts.has(i + 1));
            }
          })
      );
    setGrid(newGrid);
  }, [puzzle, getConflictingNumbers]);

  const togglePencilMark = useCallback((row: number, col: number, mark: number) => {
    if (puzzle[row][col] !== null) return; // Don't allow toggling if cell has a number

    setGrid(prevGrid => 
      prevGrid.map((r, rowIndex) =>
        r.map((cell, colIndex) =>
          rowIndex === row && colIndex === col
            ? cell.map((value, index) => (index === mark ? !value : value))
            : cell
        )
      )
    );
  }, [puzzle]);

  const handleNumberClick = useCallback((number: number | null) => {
    // TODO: Handle number input based on mode
    console.log(`Clicked ${number} in ${isPencilMode ? 'pencil' : 'normal'} mode`);
  }, [isPencilMode]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Timer />
      <div className="grid grid-cols-9 gap-[1px] bg-gray-300 p-[1px]">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 bg-white
                  ${
                    colIndex % 3 === 2 && colIndex !== 8
                      ? "border-r-2 border-r-gray-800"
                      : ""
                  }
                  ${
                    rowIndex % 3 === 2 && rowIndex !== 8
                      ? "border-b-2 border-b-gray-800"
                      : ""
                  }
                `}
              >
                {puzzle[rowIndex][colIndex] !== null ? (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-medium">
                    {puzzle[rowIndex][colIndex]}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-[8px]">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((mark) => (
                      <div
                        key={mark}
                        className={`flex items-center justify-center cursor-pointer
                          ${
                            cell[mark] && showPencilMarks
                              ? "text-gray-500"
                              : "text-transparent"
                          }
                          hover:bg-gray-100
                        `}
                        onClick={() =>
                          togglePencilMark(rowIndex, colIndex, mark)
                        }
                      >
                        {mark + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 mt-4">
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
        <Keyboard isPencilMode={isPencilMode} onNumberClick={handleNumberClick} />
      </div>
    </div>
  );
};

export default SudokuGrid;
