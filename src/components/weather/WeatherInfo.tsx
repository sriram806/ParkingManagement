import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

const WeatherInfo: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // In a real app, this would call a weather API
        // For demo, using mock data
        const mockWeather: WeatherData = {
          temperature: 28,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12
        };
        setWeather(mockWeather);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="text-yellow-500" size={24} />;
      case 'rain':
        return <CloudRain className="text-blue-500" size={24} />;
      case 'snow':
        return <CloudSnow className="text-blue-300" size={24} />;
      case 'thunderstorm':
        return <CloudLightning className="text-yellow-600" size={24} />;
      case 'windy':
        return <Wind className="text-gray-500" size={24} />;
      default:
        return <Cloud className="text-gray-400" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.condition)}
            <span className="text-2xl font-semibold">{weather.temperature}°C</span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{weather.condition}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Humidity: {weather.humidity}%
          </p>
          <p className="text-sm text-gray-600">
            Wind: {weather.windSpeed} km/h
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;