const cityName = document.querySelector("#cityTxt");
const weatherForm = document.querySelector("#weatherForm");
const btnSearch = document.querySelector("#btnSearch");
const spinner = document.querySelector("#spinner");
const weatherDiv = document.querySelector("#weatherResult");

cityName.addEventListener("change", async (e) => {
  const latlongData = await getLatLong(e.target.value);
  if (latlongData) {
    spinner.textContent = "";
    spinner.style.color = "gray";
    btnSearch.disabled = false;
    btnSearch.style.opacity = 1;
  } else {
    spinner.textContent = "Enter valid City name";
    spinner.style.color = "red";
    btnSearch.disabled = true;
    btnSearch.style.opacity = 0.5;
  }
});
weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const typedCity = cityName.value.trim();
  weatherDiv.innerHTML = "";
  if (typedCity) {
    getWeatherData(typedCity);
  }
});
async function getWeatherData(cityGet) {
  const geoInfo = await getLatLong(cityGet);
  if (geoInfo) {
    weatherDiv.style.display = "block";
    const { latitude, longitude, country, name: city } = geoInfo;
    const weatherData = await getWeatherApi(latitude, longitude);
    if (weatherData) {
      weatherDiv.style.display = "block";
      const { temperature, windspeed } = weatherData;
      showWeather(country, city, temperature, windspeed);
      localStorage.setItem("city", city);
    } else {
      weatherDiv.style.display = "none";
    }
  } else {
    weatherDiv.style.display = "none";
  }
}
async function getLatLong(city) {
  spinner.textContent = "Loading Location...";
  try {
    const response = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + city + "&count=1");
    if (!response.ok) {
      throw new Error("fetch lattitude longitude");
    }
    const geodata = await response.json();
    if (!geodata.results?.length) return null;
    return geodata.results[0];
  } catch (error) {
    console.log("error", error.message);
    spinner.textContent = "";
  }
}

async function getWeatherApi(lattitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lattitude}&longitude=${longitude}&current_weather=true`;
  spinner.textContent = "Loading Weather...";
  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error("fetch weather");
    }
    const weatherData = await response.json();
    spinner.textContent = "";
    return weatherData.current_weather;
  } catch (error) {
    console.log("error", error.message);
    spinner.textContent = "";
  }
}

function showWeather(country, city, temperature, windspeed) {
  if (weatherDiv) {
    weatherDiv.innerHTML = `<h4> <i class="fa fa-map-marker" aria-hidden="true"></i> ${country} | ${city}</h4>
    <p><i class="fa-solid fa-temperature-high"></i> ${temperature} °C </p>
    <p> <i class="fa-solid fa-wind"></i> ${windspeed}</p>
    `;
  }
}

const lastCity = localStorage.getItem("city");
if (lastCity) {
  cityName.value = lastCity;
  getWeatherData(lastCity);
}
