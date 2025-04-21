import React from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { ParkingSpot } from '../../types';
import { Clock, Calendar, User, Car } from 'lucide-react';

interface SpotDetailsProps {
  spot: ParkingSpot;
  isOpen: boolean;
  onClose: () => void;
}

const SpotDetails: React.FC<SpotDetailsProps> = ({ spot, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Parking Spot {spot.number}
            </Dialog.Title>
            
            <div className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">
                      {spot.type === 'twoWheeler' ? 'Two Wheeler' :
                       spot.type === 'threeWheeler' ? 'Three Wheeler' : 'Four Wheeler'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {format(new Date(spot.lastUpdated), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                </div>
                
                {spot.status === 'occupied' && spot.vehicle && (
                  <>
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Number</p>
                        <p className="font-medium">{spot.vehicle.vehicleNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Entry Time</p>
                        <p className="font-medium">
                          {format(new Date(spot.vehicle.entryTime), 'dd MMM yyyy, h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Guard</p>
                        <p className="font-medium">{spot.vehicle.guardName}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {spot.vehicle?.history && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">History</h3>
                  <div className="space-y-3">
                    {spot.vehicle.history.map((event) => (
                      <div key={event.id} className="flex items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-gray-400 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">
                            {event.action === 'entry' ? 'Vehicle Entered' :
                             event.action === 'exit' ? 'Vehicle Exited' :
                             event.action === 'spot_change' ? 'Spot Changed' : 'Overstay Alert'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'dd MMM yyyy, h:mm a')}
                          </p>
                          {event.details.notes && (
                            <p className="text-xs text-gray-600 mt-1">{event.details.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SpotDetails;