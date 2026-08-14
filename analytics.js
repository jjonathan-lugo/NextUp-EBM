// analytics.js
// Data analysis functions for Phone Correlation Tracker

function calculateMean(values) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateCorrelation(x, y) {
  if (x.length < 2 || y.length < 2) {
    return 0;
  }

  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < x.length; i++) {
    const differenceX = x[i] - meanX;
    const differenceY = y[i] - meanY;

    numerator += differenceX * differenceY;
    denominatorX += differenceX ** 2;
    denominatorY += differenceY ** 2;
  }

  const denominator =
    Math.sqrt(denominatorX) *
    Math.sqrt(denominatorY);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function getCorrelationStrength(value) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue < 0.2) {
    return "Very weak";
  }

  if (absoluteValue < 0.4) {
    return "Weak";
  }

  if (absoluteValue < 0.7) {
    return "Moderate";
  }

  return "Strong";
}

function analyzeData(data) {
  if (data.length < 2) {
    return null;
  }

  const screenTime = data.map(item => item.screenTime);
  const sleep = data.map(item => item.sleep);
  const study = data.map(item => item.study);
  const mood = data.map(item => item.mood);

  return {
    averages: {
      screenTime: calculateMean(screenTime),
      sleep: calculateMean(sleep),
      study: calculateMean(study),
      mood: calculateMean(mood)
    },

    correlations: {
      screenMood: calculateCorrelation(screenTime, mood),
      screenSleep: calculateCorrelation(screenTime, sleep),
      screenStudy: calculateCorrelation(screenTime, study)
    }
  };
}
