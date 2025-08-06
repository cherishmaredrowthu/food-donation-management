import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package, Clock, MapPin, FileText } from 'lucide-react';
import LocationPicker from './LocationPicker';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DonationForm {
  foodType: string;
  quantity: number;
  description: string;
  expiryTime: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
}

interface CreateDonationModalProps {
  onClose: () => void;
  onDonationCreated: (donation: any) => void;
}

const foodTypes = [
  'Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
  'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks', 'Other'
];

export default function CreateDonationModal({ onClose, onDonationCreated }: CreateDonationModalProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationForm>();

  const onSubmit = async (data: DonationForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/donations', data);
      onDonationCreated(response.data.donation);
      toast.success('Donation posted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
    setValue('location', location);
  };

  // Get current date and time for minimum expiry
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // 1 hour from now

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Food Donation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Food Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Type
              </label>
              <select
                {...register('foodType', { required: 'Food type is required' })}
                className="input-field"
              >
                <option value="">Select food type</option>
                {foodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.foodType && (
                <p className="text-red-500 text-sm mt-1">{errors.foodType.message}</p>
              )}
            </div>

            {/* Quantity and Expiry */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (servings)
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Must be at least 1 serving' }
                    })}
                    type="number"
                    className="input-field pl-10"
                    placeholder="50"
                  />
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('expiryTime', { required: 'Expiry time is required' })}
                    type="datetime-local"
                    min={minDateTime}
                    className="input-field pl-10"
                  />
                </div>
                {errors.expiryTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryTime.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={3}
                  className="input-field pl-10 resize-none"
                  placeholder="Describe the food items, any special handling instructions..."
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Post Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}