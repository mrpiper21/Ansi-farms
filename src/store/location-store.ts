import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  error: string | null;
  setLocation: (lat: number, lon: number, name: string) => void;
  setError: (message: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  locationName: null,
  error: null,
  setLocation: (lat, lon, name) => set({ latitude: lat, longitude: lon, locationName: name, error: null }),
  setError: (message) => set({ error: message }),
}));