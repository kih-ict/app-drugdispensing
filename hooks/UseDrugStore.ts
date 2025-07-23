// hooks/UseDrugStore.ts
import { create } from 'zustand';

interface Drug {
  orderId: string;
  drugId: string;
  drugName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sbu: string;
  patientPrn: string;
  patientAccount: string;
  loketNumber: string;
  loketName: string;
  subloket: string;
  quantity: number;
  uom: string;
  color: string;
}

interface DrugStore {
  drugs: Drug[];
  setDrugs: (data: Drug[]) => void;
}

export const useDrugStore = create<DrugStore>((set) => ({
  drugs: [],
  setDrugs: (data) => set({ drugs: data }),
}));
