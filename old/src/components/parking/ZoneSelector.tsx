import React from 'react';
import { motion } from 'framer-motion';
import useParkingStore from '../../stores/parkingStore';

const ZoneSelector: React.FC = () => {
  const { zones, selectedZone, setSelectedZone } = useParkingStore();

  return (
    <div className="flex space-x-2 p-4 overflow-x-auto">
      <button
        onClick={() => setSelectedZone(null)}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${!selectedZone 
            ? 'bg-primary-100 text-primary-800' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        `}
      >
        All Zones
      </button>
      
      {zones.map((zone) => (
        <motion.button
          key={zone.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedZone(zone.id)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
            ${selectedZone === zone.id 
              ? 'bg-primary-100 text-primary-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {zone.name}
          <span className="ml-2 text-xs">
            ({zone.occupied}/{zone.capacity})
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default ZoneSelector;