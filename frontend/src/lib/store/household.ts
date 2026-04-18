import { create } from 'zustand';
import type { ResolvedHousehold } from '../api/types';

interface HouseholdStore {
  resolved: ResolvedHousehold | null;
  isLoading: boolean;
  error: string | null;
  setResolved: (resolved: ResolvedHousehold) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHouseholdStore = create<HouseholdStore>((set) => ({
  resolved: null,
  isLoading: false,
  error: null,
  setResolved: (resolved) => set({ resolved, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
