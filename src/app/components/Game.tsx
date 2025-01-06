'use client';

import { useState, useEffect } from "react";
import SudokuGrid from "./SudokuGrid";

type Difficulty = 'easy' | 'medium' | 'hard';

export default function Game() {
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const fetchNewPuzzle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/puzzle?difficulty=${difficulty}`);
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
          <div className="flex gap-4 mb-4">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={solving}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
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
