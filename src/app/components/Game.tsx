'use client';

import { useState, useEffect } from "react";
import SudokuGrid from "./SudokuGrid";

export default function Game() {
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [loading, setLoading] = useState(true);

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
          <button
            onClick={fetchNewPuzzle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            New Puzzle
          </button>
        </>
      )}
    </div>
  );
}
