// Owner: Grace
export default function StartTimerRecommendations({ task }) {
  if (!task) {
    return <p>Select a task to get a timer recommendation.</p>;
  }

  let recommendedTime = 25;

  if (task.priority === "high") {
    recommendedTime = 45;
  } else if (task.priority === "medium") {
    recommendedTime = 30;
  }

  return (
    <div>
      <h2>Recommended Focus Time</h2>
      <p>
        We recommend a {recommendedTime}-minute timer for:
        {" "}
        {task.name}
      </p>
    </div>
  );
}