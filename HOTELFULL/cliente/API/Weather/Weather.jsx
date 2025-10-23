import { useEffect, useState } from "react"
import './Weather.css'

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  // Coordenadas del hotel
  const hotelUbicacion = { lat: 24.7070, lng: -81.1201 };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=0a7e114d8e014c02895132741250610&q=${hotelUbicacion.lat},${hotelUbicacion.lng}&days=7&aqi=no&alerts=no`
        );
        const data = await res.json();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <span className="weather-loading">...</span>;
  if (!weather) return null;

  return (
    <span className="weather-navbar">
      <i className="fas fa-cloud-sun"></i>
      <span className="weather-temp">{Math.round(weather.current.temp_c)}°C</span>
      <span className="weather-condition">{weather.location.name}</span>
    </span>
  );
}
