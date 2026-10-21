const API_URL = "http://127.0.0.1:8000";

let historyData = [];
let wellnessChart = null;

/*
   Current logged-in/personalized user
   We store only the name in localStorage.
   The name is NOT an ML feature.
*/
let currentUser =
    localStorage.getItem("currentUser") || "";


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId, button) {

    document.querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active-page");
        });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    }


    const titles = {

        dashboard: "Good Morning! 👋",

        checkin: "Daily Check-in",

        insights: "Insights & Trends",

        whatif: "What-If Analysis",

        history: "Wellness History"
    };


    const pageTitle =
        document.getElementById("pageTitle");


    if (pageTitle) {

        /*
           If the user is on dashboard and
           a name is available, personalize it.
        */
        if (
            pageId === "dashboard" &&
            currentUser
        ) {

            pageTitle.textContent =
                `Hi ${currentUser}! 👋`;

        } else {

            pageTitle.textContent =
                titles[pageId];

        }
    }


    if (pageId === "history") {
        loadHistory();
    }


    if (pageId === "insights") {
        loadInsights();
    }


    if (pageId === "whatif") {
        createWhatIfForms();
    }
}


function showPageById(pageId) {

    const button = document.querySelector(
        `.nav-item[onclick*="'${pageId}'"]`
    );

    showPage(pageId, button);
}


/* =========================================
   PERSONALIZED GREETING
========================================= */

function updateUserGreeting(name) {

    if (!name) {
        return;
    }


    currentUser = name;

    localStorage.setItem(
        "currentUser",
        name
    );


    const pageTitle =
        document.getElementById("pageTitle");


    if (pageTitle) {

        pageTitle.textContent =
            `Hi ${name}! 👋`;
    }
}


/* =========================================
   DATE
========================================= */

function setDate() {

    const now = new Date();

    const formatted = now.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    const currentDate =
        document.getElementById("currentDate");


    if (currentDate) {

        currentDate.textContent =
            formatted;
    }
}


/* =========================================
   GET FORM DATA
========================================= */

function getFormData() {

    return {

        /*
           Name is for personalization/database
           only. It is NOT sent to the ML model.
        */
        Name:
            document.getElementById(
                "Name"
            ).value.trim(),


        Gender:
            document.getElementById(
                "Gender"
            ).value,


        Age:
            Number(
                document.getElementById(
                    "Age"
                ).value
            ),


        Occupation:
            document.getElementById(
                "Occupation"
            ).value,


        Sleep_Duration:
            Number(
                document.getElementById(
                    "Sleep_Duration"
                ).value
            ),


        Quality_of_Sleep:
            Number(
                document.getElementById(
                    "Quality_of_Sleep"
                ).value
            ),


        Physical_Activity_Level:
            Number(
                document.getElementById(
                    "Physical_Activity_Level"
                ).value
            ),


        Stress_Level:
            Number(
                document.getElementById(
                    "Stress_Level"
                ).value
            ),


        BMI_Category:
            document.getElementById(
                "BMI_Category"
            ).value,


        Blood_Pressure:
            document.getElementById(
                "Blood_Pressure"
            ).value,


        Heart_Rate:
            Number(
                document.getElementById(
                    "Heart_Rate"
                ).value
            ),


        Daily_Steps:
            Number(
                document.getElementById(
                    "Daily_Steps"
                ).value
            ),


        Sleep_Disorder:
            document.getElementById(
                "Sleep_Disorder"
            ).value
    };
}


/* =========================================
   PREDICT WELLNESS
========================================= */

const wellnessForm =
    document.getElementById(
        "wellnessForm"
    );


if (wellnessForm) {

    wellnessForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const data =
                getFormData();


            /*
               Make sure a name was entered.
            */
            if (!data.Name) {

                alert(
                    "Please enter your name."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/predict`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.detail ||
                        "Prediction failed."
                    );

                    return;
                }


                /*
                   Save the current user.
                */
                updateUserGreeting(
                    data.Name
                );


                /*
                   Display prediction.
                */
                displayPrediction(
                    result,
                    data
                );


                /*
                   Refresh history so the
                   new prediction immediately
                   appears for this user.
                */
                await loadHistory();

            }

            catch (error) {

                alert(
                    "Cannot connect to FastAPI. " +
                    "Make sure the backend is running."
                );

                console.error(error);
            }

        }
    );
}


/* =========================================
   DISPLAY PREDICTION
========================================= */

function displayPrediction(
    result,
    data
) {

    const state =
        result.Wellness_State;


    const predictionResult =
        document.getElementById(
            "predictionResult"
        );


    if (predictionResult) {

        predictionResult.classList.remove(
            "hidden"
        );
    }


    const resultState =
        document.getElementById(
            "resultState"
        );


    if (resultState) {

        resultState.textContent =
            state;
    }


    const resultText =
        document.getElementById(
            "resultText"
        );


    if (resultText) {

        resultText.textContent =
            getStateMessage(state);
    }


    const probabilityBox =
        document.getElementById(
            "probabilities"
        );


    if (probabilityBox) {

        probabilityBox.innerHTML = "";


        Object.entries(
            result.Probabilities || {}
        ).forEach(
            ([name, value]) => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "probability-row";


                row.innerHTML = `

                    <div class="probability-label">

                        <span>${name}</span>

                        <span>${value}%</span>

                    </div>

                    <div class="progress">

                        <div
                            class="progress-fill"
                            style="width:${value}%">
                        </div>

                    </div>
                `;


                probabilityBox.appendChild(
                    row
                );
            }
        );
    }


    /*
       Update dashboard with this
       user's latest prediction.
    */
    updateDashboard(
        state,
        data
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   STATE MESSAGE
========================================= */

function getStateMessage(state) {

    if (state === "Healthy") {

        return "Your current lifestyle indicators are showing a healthy overall pattern. Keep maintaining these positive habits.";

    }


    if (state === "Moderate") {

        return "Your wellness indicators are moderate. Small improvements in sleep, activity and stress management may help.";

    }


    return "Your current indicators suggest that some lifestyle factors may need attention. Consider improving sleep, activity and stress management.";
}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard(
    state,
    data
) {

    const dashboardState =
        document.getElementById(
            "dashboardState"
        );


    if (dashboardState) {

        dashboardState.textContent =
            state;
    }


    const dashboardMessage =
        document.getElementById(
            "dashboardMessage"
        );


    if (dashboardMessage) {

        dashboardMessage.textContent =
            getStateMessage(state);
    }


    const stateBadge =
        document.getElementById(
            "stateBadge"
        );


    if (stateBadge) {

        stateBadge.textContent =
            state;
    }


    const stateDescription =
        document.getElementById(
            "stateDescription"
        );


    if (stateDescription) {

        stateDescription.textContent =
            getStateMessage(state);
    }


    const dashSleep =
        document.getElementById(
            "dashSleep"
        );


    if (dashSleep) {

        dashSleep.textContent =
            data.Sleep_Duration;
    }


    const dashActivity =
        document.getElementById(
            "dashActivity"
        );


    if (dashActivity) {

        dashActivity.textContent =
            data.Physical_Activity_Level;
    }


    const dashStress =
        document.getElementById(
            "dashStress"
        );


    if (dashStress) {

        dashStress.textContent =
            data.Stress_Level;
    }


    const dashSteps =
        document.getElementById(
            "dashSteps"
        );


    if (dashSteps) {

        dashSteps.textContent =
            data.Daily_Steps.toLocaleString();
    }


    const todayInsight =
        document.getElementById(
            "todayInsight"
        );


    if (todayInsight) {

        todayInsight.textContent =
            generateInsight(data);
    }


    const score =
        calculateWellnessScore(
            data
        );


    const scoreValue =
        document.getElementById(
            "scoreValue"
        );


    if (scoreValue) {

        scoreValue.textContent =
            score;
    }
}


/* =========================================
   WELLNESS SCORE
========================================= */

function calculateWellnessScore(
    data
) {

    let score = 0;


    if (data.Quality_of_Sleep >= 7) {

        score += 25;
    }


    if (data.Stress_Level <= 4) {

        score += 25;
    }


    if (
        data.Physical_Activity_Level >= 60
    ) {

        score += 25;
    }


    if (data.Sleep_Duration >= 7) {

        score += 25;
    }


    return score;
}


/* =========================================
   PERSONALIZED INSIGHT
========================================= */

function generateInsight(data) {

    const insights = [];


    if (data.Sleep_Duration < 7) {

        insights.push(
            "Your sleep duration is below 7 hours."
        );
    }


    if (data.Stress_Level > 6) {

        insights.push(
            "Your stress level is relatively high."
        );
    }


    if (
        data.Physical_Activity_Level < 60
    ) {

        insights.push(
            "Consider increasing your physical activity."
        );
    }


    if (data.Quality_of_Sleep >= 7) {

        insights.push(
            "Your sleep quality is looking positive."
        );
    }


    if (insights.length === 0) {

        return "Your current lifestyle indicators are looking balanced. Keep up the good work! 🌿";
    }


    return insights[0];
}


/* =========================================
   HISTORY
========================================= */

async function loadHistory() {

    /*
       Always get the current user from
       localStorage before loading history.
    */
    currentUser =
        localStorage.getItem(
            "currentUser"
        ) || "";


    /*
       If there is no user yet,
       do NOT load everyone's history.
    */
    if (!currentUser) {

        historyData = [];

        displayHistory();

        updateInsights();

        return;
    }


    try {

        /*
           Ask backend only for this user's
           history.
        */
        const response =
            await fetch(
                `${API_URL}/history?name=${encodeURIComponent(currentUser)}`
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "History request failed:",
                result
            );

            historyData = [];

            displayHistory();

            return;
        }


        historyData =
            result.history || [];


        displayHistory();


        updateInsights();

    }

    catch (error) {

        console.error(
            "History error:",
            error
        );
    }
}


/* =========================================
   DISPLAY HISTORY
========================================= */

function displayHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (historyData.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center">

                    No predictions yet.

                </td>

            </tr>

        `;

        return;
    }


    historyData.forEach(item => {

        const row =
            document.createElement(
                "tr"
            );


        const stateClass =
            item.wellness_state
                .toLowerCase();


        row.innerHTML = `

            <td>
                ${formatDate(
                    item.created_at
                )}
            </td>

            <td>
                ${item.sleep_duration} h
            </td>

            <td>
                ${item.physical_activity_level} min
            </td>

            <td>
                ${item.stress_level}/10
            </td>

            <td>
                ${Number(
                    item.daily_steps
                ).toLocaleString()}
            </td>

            <td>

                <span
                    class="history-state ${stateClass}">

                    ${item.wellness_state}

                </span>

            </td>

        `;


        table.appendChild(row);

    });
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "--";
    }


    return new Date(
        dateString
    ).toLocaleDateString(
        "en-IN"
    );
}


/* =========================================
   INSIGHTS
========================================= */

function loadInsights() {

    /*
       If there is no current user,
       don't display another user's data.
    */
    if (!currentUser) {

        historyData = [];

        updateInsights();

        return;
    }


    if (
        historyData.length === 0
    ) {

        loadHistory();

        return;
    }


    updateInsights();
}


function updateInsights() {

    if (
        historyData.length === 0
    ) {

        const totalCheckins =
            document.getElementById(
                "totalCheckins"
            );


        if (totalCheckins) {

            totalCheckins.textContent =
                "0";
        }


        const avgSleep =
            document.getElementById(
                "avgSleep"
            );


        if (avgSleep) {

            avgSleep.textContent =
                "0 h";
        }


        const avgActivity =
            document.getElementById(
                "avgActivity"
            );


        if (avgActivity) {

            avgActivity.textContent =
                "0 min";
        }


        const avgStress =
            document.getElementById(
                "avgStress"
            );


        if (avgStress) {

            avgStress.textContent =
                "0/10";
        }


        /*
           Remove old chart if there
           is no history.
        */
        if (wellnessChart) {

            wellnessChart.destroy();

            wellnessChart = null;
        }


        return;
    }


    const count =
        historyData.length;


    const avgSleep =
        historyData.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.sleep_duration
                ),
            0
        ) / count;


    const avgActivity =
        historyData.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.physical_activity_level
                ),
            0
        ) / count;


    const avgStress =
        historyData.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.stress_level
                ),
            0
        ) / count;


    const avgSleepElement =
        document.getElementById(
            "avgSleep"
        );


    if (avgSleepElement) {

        avgSleepElement.textContent =
            avgSleep.toFixed(1) + " h";
    }


    const avgActivityElement =
        document.getElementById(
            "avgActivity"
        );


    if (avgActivityElement) {

        avgActivityElement.textContent =
            avgActivity.toFixed(0) + " min";
    }


    const avgStressElement =
        document.getElementById(
            "avgStress"
        );


    if (avgStressElement) {

        avgStressElement.textContent =
            avgStress.toFixed(1) + "/10";
    }


    const totalCheckins =
        document.getElementById(
            "totalCheckins"
        );


    if (totalCheckins) {

        totalCheckins.textContent =
            count;
    }


    createChart();
}


/* =========================================
   CHART
========================================= */

function createChart() {

    const canvas =
        document.getElementById(
            "wellnessChart"
        );


    if (!canvas) {
        return;
    }


    if (wellnessChart) {

        wellnessChart.destroy();
    }


    const labels =
        historyData
            .slice()
            .reverse()
            .map(
                item =>
                    formatDate(
                        item.created_at
                    )
            );


    const scores =
        historyData
            .slice()
            .reverse()
            .map(
                item => {

                    if (
                        item.wellness_state ===
                        "Healthy"
                    ) {

                        return 3;
                    }


                    if (
                        item.wellness_state ===
                        "Moderate"
                    ) {

                        return 2;
                    }


                    return 1;
                }
            );


    wellnessChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Wellness Level",

                        data:
                            scores,

                        tension:
                            0.4,

                        borderWidth:
                            3,

                        pointRadius:
                            5

                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            min: 1,

                            max: 3,

                            ticks: {

                                stepSize: 1,

                                callback:
                                    function(value) {

                                        if (
                                            value === 3
                                        ) {

                                            return "Healthy";
                                        }


                                        if (
                                            value === 2
                                        ) {

                                            return "Moderate";
                                        }


                                        return "Concern";
                                    }
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================
   WHAT-IF FORM
========================================= */

function createWhatIfForms() {

    const fields = [

        [
            "Sleep_Duration",
            "Sleep Duration (hours)",
            "number",
            "7.5"
        ],

        [
            "Quality_of_Sleep",
            "Quality of Sleep",
            "number",
            "8"
        ],

        [
            "Physical_Activity_Level",
            "Physical Activity (minutes)",
            "number",
            "60"
        ],

        [
            "Stress_Level",
            "Stress Level",
            "number",
            "4"
        ],

        [
            "Heart_Rate",
            "Heart Rate",
            "number",
            "70"
        ],

        [
            "Daily_Steps",
            "Daily Steps",
            "number",
            "8000"
        ]

    ];


    createWhatIfSide(
        "currentWhatIfForm",
        fields,
        "current"
    );


    createWhatIfSide(
        "newWhatIfForm",
        fields,
        "new"
    );
}


function createWhatIfSide(
    containerId,
    fields,
    prefix
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    if (
        container.children.length > 0
    ) {

        return;
    }


    container.innerHTML =
        '<div class="whatif-fields"></div>';


    const wrapper =
        container.querySelector(
            ".whatif-fields"
        );


    fields.forEach(
        (
            [
                id,
                label,
                type,
                placeholder
            ]
        ) => {

            wrapper.innerHTML += `

                <div class="whatif-field">

                    <label>
                        ${label}
                    </label>

                    <input
                        type="${type}"
                        id="${prefix}_${id}"
                        placeholder="${placeholder}"
                        value="${placeholder}">

                </div>
            `;
        }
    );
}


/* =========================================
   WHAT-IF
========================================= */

async function runWhatIf() {

    const current =
        getWhatIfData(
            "current"
        );


    const future =
        getWhatIfData(
            "new"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/what-if`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            current_data:
                                current,

                            new_data:
                                future
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.detail ||
                "What-If prediction failed."
            );

            return;
        }


        const whatIfResult =
            document.getElementById(
                "whatIfResult"
            );


        if (whatIfResult) {

            whatIfResult.classList.remove(
                "hidden"
            );
        }


        const currentState =
            document.getElementById(
                "currentState"
            );


        if (currentState) {

            currentState.textContent =
                result.current_wellness_state;
        }


        const futureState =
            document.getElementById(
                "futureState"
            );


        if (futureState) {

            futureState.textContent =
                result.what_if_wellness_state;
        }

    }

    catch (error) {

        alert(
            "Cannot connect to the backend."
        );

        console.error(error);
    }
}


/* =========================================
   WHAT-IF DATA
========================================= */

function getWhatIfData(prefix) {

    /*
       Name is included because the backend
       WellnessInput schema now expects it.

       It is NOT passed to the ML model.
    */

    return {

        Name:
            currentUser ||
            "Guest",


        Gender: "Male",


        Age: 25,


        Occupation:
            "Software Engineer",


        Sleep_Duration:
            Number(
                document.getElementById(
                    `${prefix}_Sleep_Duration`
                ).value
            ),


        Quality_of_Sleep:
            Number(
                document.getElementById(
                    `${prefix}_Quality_of_Sleep`
                ).value
            ),


        Physical_Activity_Level:
            Number(
                document.getElementById(
                    `${prefix}_Physical_Activity_Level`
                ).value
            ),


        Stress_Level:
            Number(
                document.getElementById(
                    `${prefix}_Stress_Level`
                ).value
            ),


        BMI_Category:
            "Normal",


        Blood_Pressure:
            "120/80",


        Heart_Rate:
            Number(
                document.getElementById(
                    `${prefix}_Heart_Rate`
                ).value
            ),


        Daily_Steps:
            Number(
                document.getElementById(
                    `${prefix}_Daily_Steps`
                ).value
            ),


        Sleep_Disorder:
            "None"
    };
}


/* =========================================
   INITIALIZE
========================================= */

setDate();


/*
   If a user was already selected during
   a previous session, restore the name.
*/
if (currentUser) {

    updateUserGreeting(
        currentUser
    );

    loadHistory();

} else {

    /*
       Do not load all users' history.
       Start with an empty personalized dashboard.
    */
    historyData = [];

    displayHistory();

    updateInsights();
}