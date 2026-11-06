const cityName = document.querySelector("#cityTxt");
const weatherForm = document.querySelector("#weatherForm");
const btnSearch = document.querySelector("#btnSearch");
const spinner = document.querySelector("#spinner");
const historyUl = document.querySelector("#historyList");
const forecastUl = document.querySelector("#forecastList");
const weatherForeDiv = document.querySelector("#weatherForecast");
const lastCitys = JSON.parse(localStorage.getItem("cities")) || [];
const cityLocal = JSON.parse(localStorage.getItem("city"));

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

  if (typedCity) {
    getWeatherData(typedCity);
    showForecast();
  }
});
async function getWeatherData(cityGet) {
  const geoInfo = await getLatLong(cityGet);
  const cityWeatherObj = {};
  const cityObj = {};
  if (geoInfo) {
    const { latitude, longitude, country, name: city } = geoInfo;

    const weatherData = await getWeatherApi(latitude, longitude);
    if (weatherData) {
      cityObj.name = cityGet;
      cityObj.latitude = latitude;
      cityObj.longitude = longitude;
      localStorage.setItem("city", JSON.stringify(cityObj));
      const { temperature, windspeed } = weatherData;
      cityWeatherObj.country = country;
      cityWeatherObj.city = city;
      cityWeatherObj.temperature = temperature;
      cityWeatherObj.windspeed = windspeed;
      lastCitys.push(cityWeatherObj);

      localStorage.setItem("cities", JSON.stringify(lastCitys.slice(-5).reverse()));
      showWeather();
    }
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

function showWeather() {
  historyUl.innerHTML = "";
  const weatherDiv = document.querySelector("#weatherResult");
  weatherDiv.style.display = "none";
  weatherForeDiv.style.display = "none";

  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  const cityObj = JSON.parse(localStorage.getItem("city"));

  if (cityObj) {
  }
  if (cityObj) {
    cityName.value = cityObj.name;
    weatherDiv.style.display = "block";
    weatherForeDiv.style.display = "block";
    if (weatherDiv) {
      if (cities[0].temperature >= 30) {
        weatherDiv.style.backgroundColor = "red";
      }
      if (cities[0].temperature <= 20) {
        weatherDiv.style.backgroundColor = "blue";
      }
      weatherDiv.innerHTML = `<h3>Today's weather</h3><h4> <i class="fa fa-map-marker" aria-hidden="true"></i> ${cities[0].country} | ${cities[0].city}</h4>
    <p><i class="fa-solid fa-temperature-high"></i> ${cities[0].temperature} °C </p>
    <p> <i class="fa-solid fa-wind"></i> ${cities[0].windspeed}</p>
    `;
    }
    showForecast();
  }

  cities.forEach((city, index) => {
    li = document.createElement("li");

    // li.style.fontWeight = "bold";
    if (city.temperature >= 30) {
      li.style.backgroundColor = "red";
    }
    if (city.temperature <= 20) {
      li.style.backgroundColor = "blue";
    }

    li.classList.add("p-3", "rounded-lg", "bg-cyan-400", "m-2", "font-bold", "text-white");
    li.innerHTML = `<h4> <i class="fa fa-map-marker" aria-hidden="true"></i> ${city.country} | ${city.city}</h4>
    <p><i class="fa-solid fa-temperature-high"></i> ${city.temperature} °C </p>
    <p> <i class="fa-solid fa-wind"></i> ${city.windspeed}</p>
    `;
    historyUl.appendChild(li);
  });
}

showWeather();

async function showForecastApi() {
  const cityObj = JSON.parse(localStorage.getItem("city"));

  if (cityObj) {
    //https://api.open-meteo.com/v1/forecast?latitude=21.17&longitude=72.83&current_weather=true&daily=temperature_2m_max&timezone=auto&forecast_days=5
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${cityObj.latitude}&longitude=${cityObj.longitude}&current_weather=true&daily=temperature_2m_max&timezone=auto&forecast_days=5`;
    spinner.textContent = "Loading Weather...";
    try {
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error("fetch forecast 5 day weather");
      }
      const weatherData = await response.json();
      spinner.textContent = "";
      return weatherData.daily;
    } catch (error) {
      console.log("error", error.message);
      spinner.textContent = "";
    }
  }
}

async function showForecast() {
  const forecastList = await showForecastApi();
  forecastUl.innerHTML = "";
  // weatherForeDiv.style.display = "none";

  if (forecastList) {
    const forecasts = forecastList.time.map((date, index) => {
      return {
        date: date,
        temperature: forecastList.temperature_2m_max[index],
      };
    });
    // weatherForeDiv.style.display = "block";
    forecasts.forEach((item) => {
      li = document.createElement("li");
      li.classList.add("flex", "items-center", "justify-between", "gap-4", "p-3", "rounded-lg", "bg-slate-400", "mb-2", "font-bold", "text-white");
      li.innerHTML = ` <p> <i class="fa-solid fa-clock"></i> ${item.date}</p>
    <p><i class="fa-solid fa-temperature-high"></i> ${item.temperature} °C </p>
   
    `;
      forecastUl.appendChild(li);
    });
  }
}
