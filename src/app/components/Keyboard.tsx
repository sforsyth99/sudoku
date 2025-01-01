"use client";

import React from "react";

interface KeyboardProps {
  isPencilMode: boolean;
  onNumberClick: (number: number | null) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ isPencilMode, onNumberClick }) => {
  const topRow = [1, 2, 3, 4, 5];
  const bottomRow = [6, 7, 8, 9, null];

  return (
    <div className="flex flex-col gap-2 mt-8">
      <div className="flex gap-2">
        {topRow.map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className={`
              w-12 h-12 border rounded-lg
              flex items-center justify-center
              hover:bg-gray-100 active:bg-gray-200
              ${isPencilMode ? "text-sm" : "text-2xl font-medium"}
            `}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {bottomRow.map((num) => (
          <button
            key={num ?? 'x'}
            onClick={() => onNumberClick(num)}
            className={`
              w-12 h-12 border rounded-lg
              flex items-center justify-center
              hover:bg-gray-100 active:bg-gray-200
              ${isPencilMode ? "text-sm" : "text-2xl font-medium"}
            `}
          >
            {num === null ? "X" : num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
