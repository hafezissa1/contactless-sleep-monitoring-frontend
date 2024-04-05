import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

const signoutBtn = document.getElementById('signout-btn');
var summaryText = "";
var disclaimerText = "\
 This device is not for diagnostic use. \
 Please consult a medical professional if you have concerns about the health data presented.";

// Web app's Firebase configuration
// Real data from Alvin sleep
const firebaseConfig = {
    apiKey: "AIzaSyDVsMTk_uP5OGUjUTFwPgyYH2_80GbZkvY",
    authDomain: "undercover-vitals.firebaseapp.com",
    databaseURL: "https://undercover-vitals-default-rtdb.firebaseio.com",
    projectId: "undercover-vitals",
    storageBucket: "undercover-vitals.appspot.com",
    messagingSenderId: "496410237161",
    appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const auth = getAuth();

// Initialize a variable to keep track of the current child
let childrenCount = 0;
let currentChild = 0;

var id = sessionStorage.getItem('uid');

console.log(id);

const heartRateRef = ref(db, id);

// Initialize a variable to hold the chart data
let chartData = {
    labels: [],
    datasets: [
        {
            label: "Heart Rate",
            data: [],
            borderColor: "rgba(192, 75, 75, 1)",
            backgroundColor: "rgba(192, 75, 75, 0.5)",
            fill: false,
        },
        {
            label: "Turns",
            data: [],
            borderColor: "rgba(75, 75, 192, 1)",
            backgroundColor: "rgba(75, 75, 192, 0.5)",
            fill: false,
            showLine: false, // This will ensure that no line is drawn
            pointStyle: 'line', // Style of the point
            radius: 50, // Size of the point
            rotation: 90
        }
    ],
};

// Initialize the chart canvas
const chartCanvas = document.getElementById("chart").getContext("2d");

// Create a new Chart.js chart
let myChart = new Chart(chartCanvas, {
    type: "line",
    data: chartData,
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    parser: 'HH:mm:ss.SSS',
                    tooltipFormat: 'HH:mm:ss.SSS',
                    unit: 'second',
                    displayFormats: {
                        second: 'HH:mm'
                    }
                },
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Heart Rate (BPM)'
                },
                min: 45,
                max: 80
            },
        }
    },
});

function plotData(childData) {
    // Assuming childData is an object with HRWindowed, and Turns each being an array of data points
    // Clear the previous data
    chartData.datasets.forEach(dataset => {
        dataset.data = [];
    });

    // Assign data to each dataset
    if (childData.HRWindowed) {
        chartData.datasets[0].data = childData.HRWindowed.map(entry => createDataPoint(entry));
        // console.log("HR Windowed Data Points:", chartData.datasets[0].data);
    }
    if (childData.Turns) {
        chartData.datasets[1].data = childData.Turns.map(entry => createDataPoint(entry));
        // console.log("Turn Data Points:", chartData.datasets[1].data);
    }

    // Update the chart
    myChart.update();
}

function createDataPoint(obj) {
    let datePart = obj.DateTime.split('T')[0].split('-');
    let timePart = obj.DateTime.split('T')[1].split(':');
    let millisecondsPart = timePart[2].split('.')[1] || '000';

    let date = new Date();
    date.setFullYear(parseInt(datePart[0]), parseInt(datePart[1])-1, parseInt(datePart[2]));
    date.setHours(parseInt(timePart[0], 10));
    date.setMinutes(parseInt(timePart[1], 10));
    date.setSeconds(parseInt(timePart[2], 10));
    date.setMilliseconds(parseInt(millisecondsPart, 10));

    let value;
    if (obj.hasOwnProperty('HeartRate') || obj.hasOwnProperty('HeartRateMean') || obj.hasOwnProperty('HeartRateStd')) {
        value = obj.HeartRate || obj.HeartRateMean || obj.HeartRateStd;
    } else {
        // This is a "Turns" object, so find the closest heart rate value
        let closestHeartRate = findClosestHeartRate(date, chartData.datasets[0].data);
        value = closestHeartRate ? closestHeartRate : null;
    }

    return { x: date, y: value };
}

function findClosestHeartRate(turnDateTime, heartRates) {
    // console.log("heartRates",heartRates )
    let closest = null;
    let minDiff = Number.MAX_VALUE;
    
    for (let hr of heartRates) {
        let hrDateTime = new Date(hr.x);
        let diff = Math.abs(turnDateTime - hrDateTime);
        
        if (diff < minDiff) {
            minDiff = diff;
            closest = hr.y;
        }
    }
    
    return closest;
}

async function loadNextChild() {
    get(heartRateRef, 'value').then((snapshot) => {
        const keys = Object.keys(snapshot.val());
        childrenCount = keys.length;
        
        if (childrenCount > 0 && currentChild < childrenCount) {
            // console.log("reading next child");
            const currentChildRef = child(heartRateRef, keys[currentChild]);
      
            get(currentChildRef, 'value').then((childSnapshot) => {
                let childData = childSnapshot.val();
                console.log(childData)

                // Update the chart data with the new values
                plotData(childData);
                updateStatsContainer(childData);
                currentChild++;
            });
        };
    });
}

async function updateStatsContainer(childData) {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let sum = 0;
    let count = 0;

    let heartRateData = childData.HRWindowed;
    let turnsData = childData.Turns;

    heartRateData.forEach(item => {
        const heartRateMean = item.HeartRateMean;
        sum += heartRateMean;
        count += 1;
        if (heartRateMean < min) min = heartRateMean;
        if (heartRateMean > max) max = heartRateMean;
    });

    let avg = sum / count;

    summaryText = `Average Heart Rate: ${(Math.round(avg*100)/100).toString()}`;
    summaryText = `${summaryText} <br>Minimum Heart Rate: ${(Math.round(min*100)/100).toString()}`;
    summaryText = `${summaryText} <br>Maximum Heart Rate: ${(Math.round(max*100)/100).toString()}`;
    // summaryText = `${summaryText} <br>Number of Turns: ${(Math.round(turnsData.length)).toString()}`;

    document.getElementById("summary-text").innerHTML = summaryText;
}

// Retrieve all dates and store them
let availableDates = [];

async function loadAvailableDates() {
    const snapshot = await get(heartRateRef, 'value');
    availableDates = Object.keys(snapshot.val() || {});
    updateDateDropdown(availableDates);
}

// Display the dates on a dropdown menu
function updateDateDropdown(dates) {
    const selectElement = document.getElementById('date-select');
    selectElement.innerHTML = ''; // Clear current options
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        let dateObject = date.split('-')[0];
        option.innerText = new Date(dateObject.substring(0,4), dateObject.substring(4, 6)-1, dateObject.substring(6,8)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        });
        selectElement.appendChild(option);
    });
}

loadAvailableDates()

// Event listener for the dropdown to load selected date's data
document.getElementById('date-select').addEventListener('change', function() {
    const selectedDate = this.value;
    if (selectedDate) {
        currentChild = availableDates.indexOf(selectedDate);
        loadNextChild();
    }
});

loadNextChild();

function signout() {
    auth.signOut()
        .then(() => {
            // console.log("User Signed Out");

            window.location.href = "index.html";
        })
}

signoutBtn.addEventListener('click', () => {
    console.log("Sign Out");
    signout();
});


document.getElementById("disclaimer-text").innerHTML = disclaimerText;
