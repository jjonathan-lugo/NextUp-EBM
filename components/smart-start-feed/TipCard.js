// Owner: Grace
export default function TipCard({ tip }) {
  return (
    <div>
      <h3>{tip.title}</h3>
      <p>{tip.body}</p>
    </div>
  );
}