import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

// Web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDVsMTk_uP5OGUjUTFwPgyYH2_80GbZkvY",
//     authDomain: "undercover-vitals.firebaseapp.com",
//     databaseURL: "https://undercover-vitals-default-rtdb.firebaseio.com",
//     projectId: "undercover-vitals",
//     storageBucket: "undercover-vitals.appspot.com",
//     messagingSenderId: "496410237161",
//     appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
// }

// const firebaseConfig = {
//     apiKey: "AIzaSyBdnJrFKCVEfoBu4MIaZXw-QnWApab-ZAI",
//     authDomain: "contactless-sleep-sensor.firebaseapp.com",
//     databaseURL: "https://contactless-sleep-sensor-default-rtdb.firebaseio.com",
//     projectId: "contactless-sleep-sensor",
//     storageBucket: "contactless-sleep-sensor.appspot.com",
//     messagingSenderId: "496410237161",
//     appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
// };

const firebaseConfig = {
    apiKey: "AIzaSyCkoGh-j_BD5f4As_SgwRWUcJZx_NrB83U",
    authDomain: "undercover-vitals-frontend.firebaseapp.com",
    databaseURL: "https://undercover-vitals-frontend-default-rtdb.firebaseio.com",
    projectId: "undercover-vitals-frontend",
    storageBucket: "undercover-vitals-frontend.appspot.com",
    // messagingSenderId: "496410237161",
    // appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
    messagingSenderId: "406002460665",
    appId: "1:406002460665:web:75ed5a106a00f248063f28"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
  
const heartRateRef = ref(db, "processed-data-test");
// const heartRateRef = ref(db, "fsnlDhD0RqNnSxSOlsiRvAd5txm2");

// Initialize a variable to keep track of the current child
let childrenCount = 0;
let currentChild = 0;

// Initialize a variable to hold the chart data
let chartData;
chartData = {
    labels: [],
    datasets: [
        {
            label: "Heart Rate",
            data: [],
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false,
        },
    ],
};

// Initialize the chart canvas
const chartCanvas = document.getElementById("chart").getContext("2d");

// Create a new Chart.js chart
let myChart = new Chart(chartCanvas, {
    type: "line",
    data: chartData,
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    parser: 'HH:mm:ss.SSS',
                    tooltipFormat: 'HH:mm:ss.SSS',
                    unit: 'second',
                    displayFormats: {
                        second: 'HH:mm:ss'
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
                    text: 'Heart Rates'
                }
            },
        }
    },
});

function plotData(childData) {
    console.log("plotting data");

    // Clear the data
    myChart.data.datasets.data = []

    // Plot new data to Chart
    myChart.data.datasets[0].data = childData.map(obj => {
        let datePart = obj.Time.split('T')[0].split('-');
        let timePart = obj.Time.split('T')[1].split(':');
                
        // Construct date from each object in the childData
        let date = new Date()
        date.setFullYear(parseInt(datePart[0]), parseInt(datePart[1])-1, parseInt(datePart[2]));
        date.setHours(parseInt(timePart[0], 10));
        date.setMinutes(parseInt(timePart[1], 10));
        date.setSeconds(parseInt(timePart[2], 10));
        date.setMilliseconds(parseInt(timePart[3], 10));

        // console.log(date);
        
        // Return the time as an ISO string and the heart rate
        return { x: date, y: obj['Heart Rate'] };
    });

    // Update the chart
    myChart.update();
}

async function loadNextChild() {
    get(heartRateRef, 'value').then((snapshot) => {
        const keys = Object.keys(snapshot.val());
        console.log(keys);
        childrenCount = keys.length;
        
        if (childrenCount > 0 && currentChild < childrenCount) {
            console.log("reading next child");
            const currentChildRef = child(heartRateRef, keys[currentChild]);
      
            get(currentChildRef, 'value').then((childSnapshot) => {
                let childData = childSnapshot.val();
                                
                // Update the chart data with the new values
                plotData(childData);
                currentChild++;
            });
        };
    });
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
        option.innerText = date.split('T')[0];
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
// document.getElementById("load-next-child").addEventListener("click", () => {
//     loadNextChild();
// });