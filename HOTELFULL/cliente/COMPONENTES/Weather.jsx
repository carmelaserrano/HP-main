import { useEffect, useState } from "react"
import '../ESTILOS/Weather.css'
import { useTranslation } from 'react-i18next'

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
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

  if (loading) return <div>{t('weather.loading')}</div>;
  if (!weather) return <div>{t('weather.error')}</div>;

  return (
    <div>
      <h3 className="weather-title">{t('weather.title')}</h3>
      <div className="weather-container">
        {/* Clima actual */}
        <div className="weather-today">
          <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
          <p>{weather.current.temp_c}°C - {weather.current.condition.text}</p>
        </div>

        {/* Pronóstico de 7 días */}
        <div className="weather-forecast">
          {weather.forecast.forecastday.map((day) => (
            <div key={day.date}>
              <p>{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}</p>
              <img src={day.day.condition.icon} alt={day.day.condition.text} />
              <p>{day.day.avgtemp_c}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
