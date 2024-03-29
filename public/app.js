import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVsMTk_uP5OGUjUTFwPgyYH2_80GbZkvY",
    authDomain: "undercover-vitals.firebaseapp.com",
    databaseURL: "https://undercover-vitals-default-rtdb.firebaseio.com",
    projectId: "undercover-vitals",
    storageBucket: "undercover-vitals.appspot.com",
    messagingSenderId: "496410237161",
    appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
}

// const firebaseConfig = {
//     apiKey: "AIzaSyBdnJrFKCVEfoBu4MIaZXw-QnWApab-ZAI",
//     authDomain: "contactless-sleep-sensor.firebaseapp.com",
//     databaseURL: "https://contactless-sleep-sensor-default-rtdb.firebaseio.com",
//     projectId: "contactless-sleep-sensor",
//     storageBucket: "contactless-sleep-sensor.appspot.com",
//     messagingSenderId: "496410237161",
//     appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
// };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
  
// const heartRateRef = ref(db, "processed-data-test");
const heartRateRef = ref(db, "fsnlDhD0RqNnSxSOlsiRvAd5txm2");

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
        let parts = obj.Time.split(':');
        let date = new Date();
        date.setHours(parseInt(parts[0], 10));
        date.setMinutes(parseInt(parts[1], 10));
        date.setSeconds(parseInt(parts[2].split('.')[0], 10));
        date.setMilliseconds(parseInt(parts[2].split('.')[1], 10));
        
        // Return the time as an ISO string and the X value
        return { x: date, y: obj['Heart Rate'] }; // No need for toISOString(), Chart.js can handle Date objects
    });

    // Update the chart
    myChart.update();
}

    
async function loadNextChild() {
    get(heartRateRef, 'value').then((snapshot) => {
        const keys = Object.keys(snapshot.val());

        // console.log(keys);
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

loadNextChild();
document.getElementById("load-next-child").addEventListener("click", () => {
    loadNextChild();
});