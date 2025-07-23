import { create } from 'zustand';

export const UseDrugStore = create((set) => ({
  drugs: [],
  setDrugs: (data) => set({ drugs: data }),
}));