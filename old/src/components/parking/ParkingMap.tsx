import React from 'react';
import { motion } from 'framer-motion';
import { CarFront, Bike, Truck, AlertTriangle, PenTool as Tools, Ban } from 'lucide-react';
import { ParkingSpot, Vehicle } from '../../types';
import useParkingStore from '../../stores/parkingStore';

interface ParkingMapProps {
  onSpotClick?: (spot: ParkingSpot) => void;
}

const ParkingMap: React.FC<ParkingMapProps> = ({ onSpotClick }) => {
  const { spots, selectedZone } = useParkingStore();

  const getSpotIcon = (spot: ParkingSpot) => {
    if (spot.status === 'maintenance') return <Tools className="text-yellow-500" />;
    if (spot.status === 'reserved') return <Ban className="text-purple-500" />;
    
    switch (spot.type) {
      case 'twoWheeler':
        return <Bike className={spot.status === 'occupied' ? 'text-red-500' : 'text-green-500'} />;
      case 'threeWheeler':
        return <Truck className={spot.status === 'occupied' ? 'text-red-500' : 'text-green-500'} />;
      default:
        return <CarFront className={spot.status === 'occupied' ? 'text-red-500' : 'text-green-500'} />;
    }
  };

  const getSpotStatus = (spot: ParkingSpot) => {
    switch (spot.status) {
      case 'available':
        return 'bg-green-100 border-green-200';
      case 'occupied':
        return 'bg-red-100 border-red-200';
      case 'reserved':
        return 'bg-purple-100 border-purple-200';
      case 'maintenance':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {spots.filter(spot => !selectedZone || spot.id.startsWith(selectedZone)).map((spot) => (
        <motion.div
          key={spot.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSpotClick?.(spot)}
          className={`
            relative p-4 border-2 rounded-lg cursor-pointer
            transition-colors duration-200
            ${getSpotStatus(spot)}
          `}
        >
          <div className="flex flex-col items-center">
            {getSpotIcon(spot)}
            <span className="text-sm font-medium mt-2">{spot.number}</span>
            {spot.status === 'occupied' && spot.vehicle && (
              <span className="text-xs text-gray-600 mt-1">{spot.vehicle.vehicleNumber}</span>
            )}
          </div>
          
          {spot.status === 'occupied' && spot.vehicle?.history?.some(h => h.action === 'overstay_alert') && (
            <div className="absolute -top-2 -right-2">
              <AlertTriangle className="text-orange-500" size={16} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ParkingMap;