import { useState } from "react";

export default function ProductivityFeed() {

  const tips = [
    "Use active recall instead of rereading your notes.",
    "Break large assignments into smaller tasks.",
    "Put your phone away during focus sessions.",
    "Take short breaks to avoid burnout.",
    "Start with your hardest task when your energy is highest."
  ];

  const [tip, setTip] = useState(tips[0]);

  function newTip() {
    const randomTip =
      tips[Math.floor(Math.random() * tips.length)];

    setTip(randomTip);
  }

  return (
    <div>
      <h2>Productivity Tip</h2>

      <p>{tip}</p>

      <button onClick={newTip}>
        New Tip
      </button>

    </div>
  );
}