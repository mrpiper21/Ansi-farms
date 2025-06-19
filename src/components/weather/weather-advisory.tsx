// components/weather/WeatherAdvisory.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocationStore } from '../../store/location-store';
import { Colors } from '../../constants/Colors';

type Advisory = {
  color: string[];
  icon: 'alert-triangle' | 'cloud-rain' | 'sun' | 'thermometer';
  title: string;
  message: string;
};

export default function WeatherAdvisory() {
  const { latitude, longitude } = useLocationStore();
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeatherAdvisory = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        const data = await response.json();
        const advisory = getAdvisoryFromWeather(data.daily);
        setAdvisory(advisory);
      } catch (error) {
        console.error('Failed to fetch weather advisory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAdvisory();
  }, [latitude, longitude]);

  const getAdvisoryFromWeather = (daily: any): Advisory => {
    const baseAdvisory: Advisory = {
      color: [Colors.special.weatherBlue, '#1A6A8E'],
      icon: 'alert-triangle',
      title: 'Weather Advisory',
      message: 'Normal weather conditions expected',
    };

    if (!daily) return baseAdvisory;

    // Analyze next 48 hours weather
    const currentCode = daily.weathercode[0];
    const nextDayCode = daily.weathercode[1];
    const maxTemp = daily.temperature_2m_max[0];
    const minTemp = daily.temperature_2m_min[0];
    const precipitation = daily.precipitation_sum[0];

    // Temperature extremes
    if (maxTemp > 35) {
      return {
        color: [Colors.special.pestAlert, '#6A1A1A'],
        icon: 'thermometer',
        title: 'Heat Warning',
        message: 'Extreme heat expected. Schedule irrigation for early morning or evening.',
      };
    }

    if (minTemp < 5) {
      return {
        color: ['#1A6A8E', Colors.special.weatherBlue],
        icon: 'thermometer',
        title: 'Frost Advisory',
        message: 'Low temperatures expected. Protect sensitive crops from frost damage.',
      };
    }

    // Precipitation advisory
    if (precipitation > 20) {
      return {
        color: ['#0a7ea4', '#1A3A4E'],
        icon: 'cloud-rain',
        title: 'Heavy Rain Alert',
        message: 'Significant rainfall expected. Ensure proper drainage and delay fertilization.',
      };
    }

    if ([61, 63, 65, 80, 81, 82].includes(currentCode)) {
      return {
        color: [Colors.special.weatherBlue, '#1A6A8E'],
        icon: 'cloud-rain',
        title: 'Rain Expected',
        message: 'Moderate rainfall forecasted. Plan irrigation accordingly.',
      };
    }

    return baseAdvisory;
  };

  if (loading) return null;

  return (
    <LinearGradient
      colors={advisory?.color as [string, string] || [Colors.special.weatherBlue, '#1A6A8E']}
      style={styles.container}
    >
      <Feather name={advisory?.icon || 'alert-triangle'} size={24} color="white" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{advisory?.title}</Text>
        <Text style={styles.message}>{advisory?.message}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
  },
});