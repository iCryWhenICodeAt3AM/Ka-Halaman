// ---- ADJUSTED ------
const documentId = 'JCD2Qk9cMB0waP2W0ep9';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Get the document from Firestore
        const doc = await db.collection('information').doc(documentId).get();
        
        if (doc.exists) {
            const data = doc.data();
            const address = data.address;
            const farmName = data.farmName;
            const latitude = address.latitude; // Access latitude from the object
            const longitude = address.longitude; // Access longitude from the object

            // Use the retrieved data as needed
            console.log('Address:', address);
            console.log('Farm Name:', farmName);
            console.log('Latitude:', latitude);
            console.log('Longitude:', longitude);

            // Update the h1 element with the farm name
            var farmNameElement = document.getElementById('farmName');
            if (farmNameElement && farmName) {
                farmNameElement.textContent = farmName + "'s Farm";
            }

            // Fetch weather data and update the page
            fetchWeatherDataAndUpdate(latitude, longitude);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.log('Error getting document:', error);
    }
});
// ---- ADJUSTED ------

function fetchWeatherDataAndUpdate(latitude, longitude) {
    console.log(`Latitude: ${latitude}\nLongitude: ${longitude}`);
    var openWeatherMapAPIKey = '4bbc8c0707f55312541a493a5b8068ac';
    var forecastAPIUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + openWeatherMapAPIKey;
    fetch(forecastAPIUrl)
        .then(response => response.json())
        .then(data => {
            // Group forecast data by day
            var groupedForecasts = {};
            data.list.forEach(item => {
                var forecastTime = new Date(item.dt * 1000);
                var dayKey = forecastTime.toLocaleDateString();
                if (!groupedForecasts[dayKey]) {
                    groupedForecasts[dayKey] = [];
                }
                groupedForecasts[dayKey].push(item);
            });

            // Process and display forecast data for each day
            var days = [];
            var temperatures = [];
            var humidity = [];
            Object.keys(groupedForecasts).forEach(dayKey => {
                var forecastsForDay = groupedForecasts[dayKey];
                var avgTemp = forecastsForDay.reduce((acc, curr) => acc + curr.main.temp - 273.15, 0) / forecastsForDay.length; // Convert temperature to Celsius
                var avgHumidity = forecastsForDay.reduce((acc, curr) => acc + curr.main.humidity, 0) / forecastsForDay.length;
                days.push(dayKey);
                temperatures.push(avgTemp.toFixed(2)); // Round to 2 decimal places
                humidity.push(avgHumidity.toFixed(2)); // Round to 2 decimal places
            });

            // Display the line graph
            var ctx = document.getElementById('weatherChart').getContext('2d');
            var weatherChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Temperature (&deg;C)',
                        data: temperatures,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 1
                    }, {
                        label: 'Humidity (%)',
                        data: humidity,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Display forecast data in the table
            var tableBody = document.getElementById('weatherTableBody');
            days.forEach((day, index) => {
                var row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row" class="day-link" data-toggle="modal" data-target="#weatherModal">${day}</th>
                    <td>${temperatures[index]}</td>
                    <td>${humidity[index]}</td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listeners to each day link
            var dayLinks = document.querySelectorAll('.day-link');
            dayLinks.forEach((dayLink, index) => {
                dayLink.addEventListener('click', () => {
                    showDetailedWeather(dayLink.textContent, groupedForecasts[days[index]]);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function showDetailedWeather(day, forecastsForDay) {
    // Clear previous detailed weather content
    var detailedWeatherCarousel = document.getElementById('detailedWeatherCarousel');
    detailedWeatherCarousel.innerHTML = '';

    // Create carousel items for each forecast in the day
    forecastsForDay.forEach((forecast, index) => {
        var carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active'); // Set the first item as active
        }
        
        var forecastTime = new Date(forecast.dt * 1000);
        var timeOfDay = forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        carouselItem.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${day} - ${timeOfDay}</h5>
                    <p class="card-text">Temperature: ${(forecast.main.temp - 273.15).toFixed(2)} &deg;C</p>
                    <p class="card-text">Humidity: ${forecast.main.humidity.toFixed(2)} %</p>
                    <p class="card-text">Description: ${forecast.weather[0].description}</p>
                </div>
            </div>
        `;
        detailedWeatherCarousel.appendChild(carouselItem);
    });

    // Activate the carousel
    $('#carouselExampleControls').carousel();

    // Change text color to black
    var cardTextElements = document.querySelectorAll('.card-text');
    cardTextElements.forEach(element => {
        element.style.color = 'black';
    });
    var cardTextElements2 = document.querySelectorAll('.card-title');
    cardTextElements2.forEach(element => {
        element.style.color = 'black';
    });
}


