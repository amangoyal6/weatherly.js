const weatherApi = {
  key: "3d1d06290717d250b9f0c713a7edfcf2",
  baseUrl: "https://api.openweathermap.org/data/2.5/weather",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast"
};

const txtInput = document.getElementById("input-box");
const btnWeather = document.getElementById("button");

const hTemp = document.getElementById("temp");
const hCity = document.getElementById("city");
const divWeatherBody = document.getElementById("weather-body");
const divErrorMessage = document.getElementById("error-message");
const forecastSection = document.getElementById("forecast-section");
const humSection = document.getElementById("humidity-section");

const pDate = document.getElementById("date");
const pMinMax = document.getElementById("min-max");
const pWeather = document.getElementById("weather");
const pHumadity = document.getElementById("humadity");
const pWind = document.getElementById("wind");
const pPressure = document.getElementById("pressure");

let forecastChart, humidityChart;
let forecastRawData = null;

// Events
txtInput.addEventListener("keypress", async (e) => { if(e.key==="Enter") await getWeatherReport(txtInput.value); });
btnWeather.addEventListener("click", async () => await getWeatherReport(txtInput.value));

// Main Function
async function getWeatherReport(city){
  try{
    if(!city) return;
    const response = await fetch(`${weatherApi.baseUrl}?q=${encodeURIComponent(city)}&appid=${weatherApi.key}&units=metric`);
    if(!response.ok) throw new Error("City Not Found");
    const data = await response.json();
    showWeatherReport(data);

    divWeatherBody.classList.remove("d-none");
    forecastSection.classList.remove("d-none");
    humSection.classList.remove("d-none");
    divErrorMessage.classList.add("d-none");

    await getForecastAndHumidityCharts(city);

  }catch(err){
    console.log(err);
    divWeatherBody.classList.add("d-none");
    forecastSection.classList.add("d-none");
    humSection.classList.add("d-none");
    divErrorMessage.classList.remove("d-none");
    clearWeatherDisplay();
  }
}

// Show Current Weather
function showWeatherReport(weather){
  hCity.innerText = `${weather.name}, ${weather.sys.country}`;
  pDate.innerText = formatDate(new Date());
  hTemp.innerHTML = `${Math.round(weather.main.temp)}&deg;C`;
  pMinMax.innerHTML = `${Math.floor(weather.main.temp_min)}&deg;C(min)/${Math.ceil(weather.main.temp_max)}&deg;C(max)`;
  pWeather.innerText = weather.weather[0].main;
  pHumadity.innerText = `${weather.main.humidity}%`;
  pWind.innerText = `${weather.wind.speed} kmph`;
  pPressure.innerText = `${weather.main.pressure} hPa`;
  updateBackground(weather.weather[0].main);
}

function formatDate(date){ 
  return date.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
}

function updateBackground(weatherType){
  const backgrounds = {
    Clear:"Images/clear.jpg",
    Clouds:"Images/clouds.jpg",
    Haze:"Images/haze.jpg",
    Rain:"Images/rain.jpg",
    Thunderstorm:"Images/thunder.jpg",
    Sunny:"Images/sunny.jpg",
    Snow:"Images/snow.jpg"
  };
  document.body.style.backgroundImage = `url(${backgrounds[weatherType]||"Images/clear.jpg"})`;
}

// Charts
async function getForecastAndHumidityCharts(city){
  const res = await fetch(`${weatherApi.forecastUrl}?q=${encodeURIComponent(city)}&appid=${weatherApi.key}&units=metric`);
  const data = await res.json();
  forecastRawData = data; // save globally

  const labels=[], tempData=[], humData=[];
  const dailyTemp={}, dailyHum={};

  data.list.forEach(item=>{
    const date = item.dt_txt.split(" ")[0];
    if(!dailyTemp[date]) dailyTemp[date]=item.main.temp;
    if(!dailyHum[date]) dailyHum[date]=item.main.humidity;
  });

  Object.keys(dailyTemp).slice(0,5).forEach(date=>{
    labels.push(date);
    tempData.push(dailyTemp[date]);
    humData.push(dailyHum[date]);
  });

  // Destroy old charts if exist
  if(forecastChart) forecastChart.destroy();
  if(humidityChart) humidityChart.destroy();

  // Temperature Chart
  const ctx = document.getElementById("forecastChart").getContext("2d");
  forecastChart = new Chart(ctx,{
    type:"line",
    data:{labels, datasets:[{label:"Temperature (°C)", data:tempData, borderColor:"blue", backgroundColor:"rgba(0,0,255,0.2)", fill:true}]}
  });

  // Humidity Chart
  const humCtx = document.getElementById("humidityChart").getContext("2d");
  humidityChart = new Chart(humCtx,{
    type:"line",
    data:{labels, datasets:[{label:"Humidity (%)", data:humData, borderColor:"green", backgroundColor:"rgba(0,255,0,0.2)", fill:true}]}
  });
}

// Clear
function clearWeatherDisplay(){
  hCity.innerText="";
  pDate.innerText="";
  hTemp.innerText="";
  pMinMax.innerText="";
  pWeather.innerText="";
  pHumadity.innerText="";
  pWind.innerText="";
  pPressure.innerText="";
}
