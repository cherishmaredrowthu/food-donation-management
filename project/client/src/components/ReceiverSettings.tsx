import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { X, Save, MapPin, Users, Package } from 'lucide-react';
import LocationPicker from './LocationPicker';

interface SettingsForm {
  name: string;
  phone: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  preferences: {
    foodCategories: string[];
    beneficiaryCount: number;
    radiusKm: number;
  };
}

const foodCategories = [
  'Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
  'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks'
];

interface ReceiverSettingsProps {
  onClose: () => void;
}

export default function ReceiverSettings({ onClose }: ReceiverSettingsProps) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<SettingsForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || { address: '', coordinates: [0, 0] },
      preferences: user?.preferences || {
        foodCategories: [],
        beneficiaryCount: 50,
        radiusKm: 10
      }
    }
  });

  const selectedCategories = watch('preferences.foodCategories') || [];

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true);
    try {
      await updateUser(data);
      onClose();
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
    setValue('location', location);
  };

  const toggleFoodCategory = (category: string) => {
    const current = selectedCategories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setValue('preferences.foodCategories', updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  type="tel"
                  className="input-field"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Location
              </label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Food Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Food Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {foodCategories.map(category => (
                  <label
                    key={category}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors text-sm ${
                      selectedCategories.includes(category)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleFoodCategory(category)}
                      className="sr-only"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Capacity and Radius */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiary Count
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('preferences.beneficiaryCount', { 
                      required: 'Beneficiary count is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    })}
                    type="number"
                    className="input-field pl-10"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (km)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('preferences.radiusKm', { 
                      required: 'Service radius is required',
                      min: { value: 1, message: 'Must be at least 1km' }
                    })}
                    type="number"
                    className="input-field pl-10"
                    placeholder="10"
                  />
                </div>
              </div>
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
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}