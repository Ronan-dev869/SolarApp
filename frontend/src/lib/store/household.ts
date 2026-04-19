import { create } from 'zustand';
import type { ResolvedHousehold } from '../api/types';
import type { NeighborAverages } from '../calc/neighborAverages';
import { apiClient } from '../api/client';

interface HouseholdStore {
  resolved: ResolvedHousehold | null;
  isLoading: boolean;
  error: string | null;
  neighbors: NeighborAverages | null;
  setResolved: (resolved: ResolvedHousehold) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNeighbors: (neighbors: NeighborAverages | null) => void;
  refreshAtLocation: (lat: number, lon: number) => Promise<void>;
}

export const useHouseholdStore = create<HouseholdStore>((set, get) => ({
  resolved: null,
  isLoading: false,
  error: null,
  neighbors: null,
  setResolved: (resolved) =>
    set({ resolved, isLoading: false, error: null, neighbors: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setNeighbors: (neighbors) => set({ neighbors }),
  refreshAtLocation: async (lat, lon) => {
    const { resolved } = get();
    if (!resolved) {
      set({ error: 'Submit the form before clicking on the map.' });
      return;
    }
    set({ isLoading: true, error: null, neighbors: null });
    try {
      const geocode = { ...resolved.geocode, lat, lon };
      const solar = await apiClient.getSolarPotential({
        lat,
        lon,
        panelCount: resolved.input.panelCount,
      });
      const stats = await apiClient.getHouseholdStats({
        input: resolved.input,
        geocode,
        solar,
      });
      set({
        resolved: { input: resolved.input, geocode, solar, stats },
        isLoading: false,
      });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : 'Failed to load solar data for that location.',
        isLoading: false,
      });
    }
  },
}));
