"use client";

import React from "react";
import styles from "./Keyboard.module.css";

interface KeyboardProps {
  isPencilMode: boolean;
  onNumberClick: (number: number | null) => void;
}

const Keyboard = ({ isPencilMode, onNumberClick }: KeyboardProps) => {
  const topRow = [1, 2, 3, 4, 5];
  const bottomRow = [6, 7, 8, 9, null];

  return (
    <div className={styles.keyboard}>
      <div className={styles.row}>
        {topRow.map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className={`${styles.button} ${isPencilMode ? styles.pencilMode : ''}`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        {bottomRow.map((num) => (
          <button
            key={num ?? "x"}
            onClick={() => onNumberClick(num)}
            className={`${styles.button} ${isPencilMode ? styles.pencilMode : ''}`}
          >
            {num === null ? "X" : num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
