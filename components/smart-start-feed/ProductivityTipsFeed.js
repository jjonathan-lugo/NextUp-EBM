// Owner: Grace
import TipCard from "./TipCard";

export default function ProductivityTipsFeed() {
  const tips = [
    {
      id: 1,
      title: "Take Short Breaks",
      body: "Taking short breaks can help you stay focused and avoid burnout.",
    },
    {
      id: 2,
      title: "Break Tasks Into Steps",
      body: "Large tasks feel easier when you divide them into smaller steps.",
    },
    {
      id: 3,
      title: "Put Your Phone Away",
      body: "Keeping distractions away can help you concentrate on your work.",
    },
  ];

  return (
    <div>
      <h2>Productivity Tips 💡</h2>

      {tips.map((tip) => (
        <TipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}