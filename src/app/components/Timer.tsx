"use client";

import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import styles from "./Timer.module.css";

interface TimerProps {
  isRunning: boolean;
}

const Timer = ({ isRunning }: TimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const intl = useIntl();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={styles.timer}>
      {intl.formatMessage(
        { id: "timer.label" },
        { time: formatTime(seconds) }
      )}
    </div>
  );
};

export default Timer;
