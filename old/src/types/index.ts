export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  entryTime: string;
  exitTime: string | null;
  guardId: string;
  guardName: string;
  shift: 'day' | 'night';
  fees: number | null;
  status: 'active' | 'exited';
  parkingSpot?: string;
  color?: string;
  brand?: string;
  history?: VehicleHistory[];
}

export interface VehicleHistory {
  id: string;
  vehicleId: string;
  action: 'entry' | 'exit' | 'spot_change' | 'overstay_alert';
  timestamp: string;
  details: {
    parkingSpot?: string;
    fees?: number;
    guardName?: string;
    notes?: string;
  };
}

export interface ParkingSpot {
  id: string;
  number: string;
  type: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  vehicle?: Vehicle;
  lastUpdated: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  spots: ParkingSpot[];
  type: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  capacity: number;
  occupied: number;
}