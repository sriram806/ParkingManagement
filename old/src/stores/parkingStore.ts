import { create } from 'zustand';
import { ParkingSpot, ParkingZone, Vehicle } from '../types';

interface ParkingState {
  spots: ParkingSpot[];
  zones: ParkingZone[];
  selectedZone: string | null;
  loading: boolean;
  error: string | null;
  setSpots: (spots: ParkingSpot[]) => void;
  setZones: (zones: ParkingZone[]) => void;
  setSelectedZone: (zoneId: string | null) => void;
  updateSpot: (spotId: string, updates: Partial<ParkingSpot>) => void;
  assignVehicle: (spotId: string, vehicle: Vehicle) => void;
  removeVehicle: (spotId: string) => void;
}

const useParkingStore = create<ParkingState>((set) => ({
  spots: [],
  zones: [],
  selectedZone: null,
  loading: false,
  error: null,
  
  setSpots: (spots) => set({ spots }),
  setZones: (zones) => set({ zones }),
  setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
  
  updateSpot: (spotId, updates) => 
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === spotId ? { ...spot, ...updates } : spot
      ),
    })),
    
  assignVehicle: (spotId, vehicle) =>
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === spotId
          ? { ...spot, status: 'occupied', vehicle, lastUpdated: new Date().toISOString() }
          : spot
      ),
    })),
    
  removeVehicle: (spotId) =>
    set((state) => ({
      spots: state.spots.map((spot) =>
        spot.id === spotId
          ? { ...spot, status: 'available', vehicle: undefined, lastUpdated: new Date().toISOString() }
          : spot
      ),
    })),
}));

export default useParkingStore;