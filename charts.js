// charts.js
// Creates visualizations for Phone Correlation Tracker

function createChart(canvasId, labels, xValues, yValues, xLabel, yLabel) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const padding = 50;

  const maxX = Math.max(...xValues, 1);
  const maxY = Math.max(...yValues, 1);

  // Draw axes
  ctx.beginPath();
  ctx.moveTo(padding, 20);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - 20, height - padding);
  ctx.stroke();

  // Draw points
  yValues.forEach((value, index) => {
    const x =
      padding +
      (xValues[index] / maxX) *
        (width - padding - 30);

    const y =
      height -
      padding -
      (value / maxY) *
        (height - padding - 30);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Axis labels
  ctx.font = "12px Arial";
  ctx.fillText(xLabel, width / 2 - 30, height - 10);

  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

function updateCharts(data) {
  if (!data || data.length < 2) {
    return;
  }

  const dates = data.map(item => item.date);

  createChart(
    "screenMoodChart",
    dates,
    data.map(item => item.screenTime),
    data.map(item => item.mood),
    "Screen time",
    "Mood"
  );

  createChart(
    "screenSleepChart",
    dates,
    data.map(item => item.screenTime),
    data.map(item => item.sleep),
    "Screen time",
    "Sleep"
  );

  createChart(
    "screenStudyChart",
    dates,
    data.map(item => item.screenTime),
    data.map(item => item.study),
    "Screen time",
    "Study"
  );
}
