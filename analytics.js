// analytics.js
// Statistical functions for Phone Correlation Tracker


function calculateMean(values) {

    if (values.length === 0) {
        return 0;
    }

    const total = values.reduce(
        (sum, value) => sum + value,
        0
    );

    return total / values.length;
}


function calculateCorrelation(x, y) {

    if (
        x.length < 2 ||
        y.length < 2 ||
        x.length !== y.length
    ) {
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


        numerator +=
            differenceX * differenceY;

        denominatorX +=
            differenceX * differenceX;

        denominatorY +=
            differenceY * differenceY;
    }


    const denominator =
        Math.sqrt(
            denominatorX *
            denominatorY
        );


    if (denominator === 0) {
        return 0;
    }


    return numerator / denominator;
}


function getCorrelationStrength(value) {

    const absoluteValue =
        Math.abs(value);


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
