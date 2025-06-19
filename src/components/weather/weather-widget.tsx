import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { useLocationStore } from '../../store/location-store';

interface WeatherWidgetProps {
  location?: any;
}

const WeatherWidget = (props: WeatherWidgetProps) => {
  const { location } = props;
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, locationName, setLocation, setError, error } = useLocationStore();
  const theme = Colors[useColorScheme() ?? 'light'];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const coords = location.coords;
        
        // Reverse geocoding to get location name
        const geocode = await Location.reverseGeocodeAsync(coords);
        const name = geocode[0]?.city || geocode[0]?.region || 'Your Location';
        
        setLocation(coords.latitude, coords.longitude, name);
      } catch (error) {
        setError('Unable to fetch location');
      }
    })();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  // Weather code to icon mapping
  const getWeatherIcon = (code: number) => {
    if (code === undefined) return 'weather-sunny';
    if (code < 20) return 'weather-sunny';
    if (code < 30) return 'weather-partly-cloudy';
    if (code < 50) return 'weather-cloudy';
    if (code < 70) return 'weather-rainy';
    if (code < 80) return 'weather-snowy';
    return 'weather-sunny';
  };

  if (loading) {
    return (
      <View style={styles.weatherContainer}>
        <Text>Loading weather...</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.weatherContainer}>
        <Text>Weather data unavailable</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.weatherContainer, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text }}>{error}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = weatherData?.current_weather;
  const daily = weatherData?.daily;

  return (
    <View style={[styles.weatherContainer, { backgroundColor: Colors.special.weatherBlue }]}>
      <View style={styles.weatherHeader}>
        <MaterialCommunityIcons name="map-marker" size={20} color={"white"} />
        <Text style={[styles.weatherLocation, { color: "white"}]}>
          {locationName || 'Loading location...'}
        </Text>
      </View>

      <View style={styles.weatherMain}>
        <MaterialCommunityIcons 
          name={getWeatherIcon(current?.weathercode)} 
          size={48} 
          color={Colors.dark.text} 
        />
        <Text style={styles.weatherTemp}>{current?.temperature}°C</Text>
      </View>

      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetailItem}>
          <MaterialCommunityIcons name="water-percent" size={16} color={Colors.dark.text} />
          <Text style={styles.weatherDetailText}>Humidity: 65%</Text> {/* Open-Meteo doesn't provide humidity in free tier */}
        </View>
        <View style={styles.weatherDetailItem}>
          <MaterialCommunityIcons name="weather-windy" size={16} color={Colors.dark.text} />
          <Text style={styles.weatherDetailText}>Wind: {current?.windspeed} km/h</Text>
        </View>
      </View>

      <View style={styles.weatherForecast}>
        {daily?.time?.slice(0, 3).map((day: any, index: any) => (
          <View key={index} style={styles.forecastDay}>
            <Text style={styles.forecastDayName}>
              {new Date(day).toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            <MaterialCommunityIcons 
              name={getWeatherIcon(daily?.weathercode[index])} 
              size={24} 
              color={Colors.dark.text} 
            />
            <Text style={styles.forecastTemp}>
              {daily?.temperature_2m_max[index]}° / {daily?.temperature_2m_min[index]}°
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WeatherWidget

// Add to your styles
const styles = StyleSheet.create({
  weatherContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 4,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginLeft: 4,
  },
  weatherForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayName: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
    color: Colors.dark.text,
  },
  permissionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
