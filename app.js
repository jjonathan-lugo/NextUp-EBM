// app.js

const STORAGE_KEY =
    "phoneCorrelationTracker";


let entries =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];



const form =
    document.getElementById("dataForm");

const dateInput =
    document.getElementById("date");

const screenInput =
    document.getElementById("screenTime");

const sleepInput =
    document.getElementById("sleep");

const studyInput =
    document.getElementById("study");

const moodInput =
    document.getElementById("mood");

const table =
    document.getElementById("dataTable");

const correlationResults =
    document.getElementById(
        "correlationResults"
    );

const clearButton =
    document.getElementById(
        "clearButton"
    );



/* Set today's date */

dateInput.value =
    new Date()
        .toISOString()
        .split("T")[0];



/* Save data */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
    );
}



/* Add new entry */

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const entry = {

            date:
                dateInput.value,

            screenTime:
                Number(
                    screenInput.value
                ),

            sleep:
                Number(
                    sleepInput.value
                ),

            study:
                Number(
                    studyInput.value
                ),

            mood:
                Number(
                    moodInput.value
                )
        };


        entries.push(entry);


        entries.sort(
            (a, b) =>
                a.date.localeCompare(
                    b.date
                )
        );


        saveData();


        form.reset();


        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];


        render();
    }
);



/* Clear data */

clearButton.addEventListener(
    "click",
    function () {

        if (entries.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete all data?"
            );


        if (!confirmed) {
            return;
        }


        entries = [];


        saveData();


        render();
    }
);



/* Update statistics */

function updateStatistics() {

    const total =
        entries.length;


    document.getElementById(
        "totalEntries"
    ).textContent = total;


    if (total === 0) {

        document.getElementById(
            "averageScreen"
        ).textContent = "0h";

        document.getElementById(
            "averageMood"
        ).textContent = "0/10";

        document.getElementById(
            "averageSleep"
        ).textContent = "0h";

        return;
    }


    const screenTimes =
        entries.map(
            entry =>
                entry.screenTime
        );


    const moods =
        entries.map(
            entry =>
                entry.mood
        );


    const sleep =
        entries.map(
            entry =>
                entry.sleep
        );


    document.getElementById(
        "averageScreen"
    ).textContent =
        calculateMean(
            screenTimes
        ).toFixed(1) + "h";


    document.getElementById(
        "averageMood"
    ).textContent =
        calculateMean(
            moods
        ).toFixed(1) + "/10";


    document.getElementById(
        "averageSleep"
    ).textContent =
        calculateMean(
            sleep
        ).toFixed(1) + "h";
}



/* Display table */

function updateTable() {

    table.innerHTML = "";


    const reversedEntries =
        [...entries].reverse();


    reversedEntries.forEach(
        entry => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>${entry.date}</td>

                <td>
                    ${entry.screenTime}h
                </td>

                <td>
                    ${entry.sleep}h
                </td>

                <td>
                    ${entry.study}h
                </td>

                <td>
                    ${entry.mood}/10
                </td>

            `;


            table.appendChild(row);
        }
    );
}



/* Create correlation box */

function createCorrelation(
    title,
    value
) {

    const strength =
        getCorrelationStrength(
            value
        );


    let direction;


    if (value > 0.05) {

        direction =
            "positive relationship";

    } else if (value < -0.05) {

        direction =
            "negative relationship";

    } else {

        direction =
            "little or no relationship";
    }


    return `

        <div class="correlation">

            <div class="correlation-title">
                ${title}
            </div>

            <div class="correlation-value">
                ${value.toFixed(2)}
            </div>

            <div class="correlation-description">
                ${strength} correlation ·
                ${direction}
            </div>

        </div>

    `;
}



/* Calculate correlations */

function updateCorrelations() {

    if (entries.length < 2) {

        correlationResults.innerHTML = `

            <p class="empty">
                Add at least two entries
                to see correlations.
            </p>

        `;

        return;
    }


    const screenTime =
        entries.map(
            entry =>
                entry.screenTime
        );


    const sleep =
        entries.map(
            entry =>
                entry.sleep
        );


    const study =
        entries.map(
            entry =>
                entry.study
        );


    const mood =
        entries.map(
            entry =>
                entry.mood
        );


    const screenMood =
        calculateCorrelation(
            screenTime,
            mood
        );


    const screenSleep =
        calculateCorrelation(
            screenTime,
            sleep
        );


    const screenStudy =
        calculateCorrelation(
            screenTime,
            study
        );


    correlationResults.innerHTML =

        createCorrelation(
            "Screen Time ↔ Mood",
            screenMood
        )

        +

        createCorrelation(
            "Screen Time ↔ Sleep",
            screenSleep
        )

        +

        createCorrelation(
            "Screen Time ↔ Study",
            screenStudy
        );
}



/* Render everything */

function render() {

    updateStatistics();

    updateTable();

    updateCorrelations();
}



/* Start application */

render();
