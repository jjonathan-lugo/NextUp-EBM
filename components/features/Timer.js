import { useEffect, useState } from "react";

export default function Timer() {
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("Pomodoro");

  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {
        setSeconds((time) => {
          if (time === 600 && mode === "Adaptive") {
            setMessage(
              "You've been working for a while. Consider taking a break!"
            );
          }

          if (time <= 0) {
            setRunning(false);
            setMessage(
              "Focus session complete! Take a short break."
            );
            return 0;
          }

          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running, mode]);

  return (
    <div>
      <h2>Focus Timer</h2>

      <h1>
        {Math.floor(seconds / 60)}:
        {(seconds % 60).toString().padStart(2, "0")}
      </h1>

      <p>Mode: {mode}</p>

      <p>{message}</p>

      <button
        onClick={() =>
          setMode(mode === "Pomodoro" ? "Adaptive" : "Pomodoro")
        }
      >
        Switch Mode
      </button>

      <br />

      <button onClick={() => setRunning(true)}>
        Start
      </button>

      <button onClick={() => setRunning(false)}>
        Pause
      </button>

      <button
        onClick={() => {
          setSeconds(1500);
          setRunning(false);
          setMessage("");
        }}
      >
        Reset
      </button>
    </div>
  );
}