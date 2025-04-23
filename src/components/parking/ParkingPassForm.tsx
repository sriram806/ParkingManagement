import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format, addMonths } from 'date-fns';
import { X } from 'lucide-react';
import { Vehicle } from '../../types';
import apiService from '../../services/apiService';
import BillPrint from '../billing/BillPrint';

interface ParkingPassFormProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormInput {
  months: number;
}

const ParkingPassForm: React.FC<ParkingPassFormProps> = ({ vehicle, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [bill, setBill] = useState<any>(null);

  const { register, handleSubmit, watch } = useForm<FormInput>({
    defaultValues: { months: 1 }
  });

  const months = watch('months');
  const ratePerMonth = vehicle.vehicleType === 'twoWheeler' ? 1000 :
                      vehicle.vehicleType === 'threeWheeler' ? 1500 : 2000;
  const totalAmount = months * ratePerMonth;

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    try {
      const response = await apiService.createParkingPass({
        vehicleId: vehicle.id,
        monthsDuration: data.months,
        amount: totalAmount
      });
      setBill(response.data.bill);
      setShowBill(true);
      onSuccess();
    } catch (error) {
      console.error('Error creating parking pass:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Create Parking Pass</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Vehicle Number:</span>
                <span>{vehicle.vehicleNumber}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Vehicle Type:</span>
                <span>
                  {vehicle.vehicleType === 'twoWheeler' ? 'Two Wheeler' :
                   vehicle.vehicleType === 'threeWheeler' ? 'Three Wheeler' : 'Four Wheeler'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                className="input"
                {...register('months', { required: true, min: 1, max: 12 })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Valid from {format(new Date(), 'dd MMM yyyy')} to{' '}
                {format(addMonths(new Date(), months), 'dd MMM yyyy')}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Rate per month</p>
                  <p className="text-lg font-semibold">₹{ratePerMonth}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total amount</p>
                  <p className="text-lg font-semibold">₹{totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Create Pass'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showBill && bill && (
        <BillPrint
          bill={bill}
          onClose={() => {
            setShowBill(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ParkingPassForm;