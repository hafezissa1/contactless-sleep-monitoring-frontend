// Firebase config
var firebaseConfig = {
    apiKey: "AIzaSyBdnJrFKCVEfoBu4MIaZXw-QnWApab-ZAI",
    authDomain: "contactless-sleep-sensor.firebaseapp.com",
    projectId: "contactless-sleep-sensor",
    storageBucket: "contactless-sleep-sensor-default-rtdb.firebaseio.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var ctx = document.getElementById('sensorChart').getContext('2d');
var sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels will go here
        datasets: [{
            label: 'Sensor Value',
            data: [], // Sensor data will go here
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

// Function to fetch data from Firestore
function fetchData() {
    db.collection("n8eU0vE8Jhb7MFnQ5f4V1hJvLao2").orderBy("timestamp").get().then((querySnapshot) => {
        var labels = [];
        var data = [];
        querySnapshot.forEach((doc) => {
            labels.push(doc.data().timestamp); // Assuming 'timestamp' is stored
            data.push(doc.data().sensorValue); // Assuming 'sensorValue' is stored
        });
        sensorChart.data.labels = labels;
        sensorChart.data.datasets[0].data = data;
        sensorChart.update();
    });
}

// Call fetchData to populate the chart
fetchData();