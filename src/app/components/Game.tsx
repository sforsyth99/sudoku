'use client';

import { useState, useEffect } from "react";
import SudokuGrid from "./SudokuGrid";

export default function Game() {
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);

  const fetchNewPuzzle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/puzzle');
      const data = await response.json();
      setPuzzle(data.puzzle);
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
    setLoading(false);
  };

  const solvePuzzle = async () => {
    setSolving(true);
    try {
      const response = await fetch('/api/puzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ puzzle }),
      });
      const data = await response.json();
      setPuzzle(data.solution);
    } catch (error) {
      console.error('Error solving puzzle:', error);
    }
    setSolving(false);
  };

  useEffect(() => {
    fetchNewPuzzle();
  }, []);

  return (
    <div className="flex flex-col gap-8 items-center">
      {loading ? (
        <div>Loading new puzzle...</div>
      ) : (
        <>
          <SudokuGrid puzzle={puzzle} />
          <div className="flex gap-4">
            <button
              onClick={fetchNewPuzzle}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={solving}
            >
              New Puzzle
            </button>
            <button
              onClick={solvePuzzle}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={solving}
            >
              {solving ? 'Solving...' : 'Solve Puzzle'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
