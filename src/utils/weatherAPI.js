// utils/weatherAPI.js
/**
 * Fetches weather conditions from OpenWeatherMap API
 *
 * @async
 * @function fetchWeatherConditions
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 * @returns {Promise<Object>} - Promise resolving to formatted weather data object
 */
export async function fetchWeatherConditions(lat, lng) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error(
      "OpenWeather API key is missing. Please set VITE_OPENWEATHER_API_KEY in your .env file"
    );
    return null;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const weatherData = await response.json();

    // Convert timestamps to readable date/time
    const formatTime = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatDateTime = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleString();
    };

    const formattedWeatherData = {
      temperature: `${weatherData.main.temp.toFixed(1)}°C`,
      temperatureMax: `${weatherData.main.temp_max}°C`,
      temperatureMin: `${weatherData.main.temp_min}°C`,
      pressure: `${weatherData.main.pressure} hPa`,
      sunRise: formatTime(weatherData.sys.sunrise),
      sunSet: formatTime(weatherData.sys.sunset),
      sunRiseFull: formatDateTime(weatherData.sys.sunrise),
      sunSetFull: formatDateTime(weatherData.sys.sunset),
      windSpeed: `${weatherData.wind.speed} m/s`,
      windDirection: `${weatherData.wind.deg}°`,
      description: weatherData.weather[0].description,
      descriptionIcon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
      humidity: `${weatherData.main.humidity}%`,
      visibility: `${weatherData.visibility / 1000} km`,
    };

    // console.log("Formatted Weather Data:", formattedWeatherData);
    return formattedWeatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
