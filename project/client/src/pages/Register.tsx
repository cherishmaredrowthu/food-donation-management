import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Mail, Lock, User, Phone, MapPin, Users } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'donor' | 'receiver';
  organizationName?: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  preferences?: {
    foodCategories: string[];
    beneficiaryCount: number;
    radiusKm: number;
  };
}

const foodCategories = [
  'Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
  'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks'
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') as 'donor' | 'receiver' || 'donor';
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      role: defaultRole,
      preferences: {
        foodCategories: [],
        beneficiaryCount: 50,
        radiusKm: 10
      }
    }
  });

  const selectedRole = watch('role');
  const selectedCategories = watch('preferences.foodCategories') || [];

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await registerUser(data);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Join FoodShare</h2>
          <p className="mt-2 text-gray-600">Create your account to start making a difference</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedRole === 'donor' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}>
                  <input
                    {...register('role')}
                    type="radio"
                    value="donor"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                    <div className="font-medium">Food Donor</div>
                    <div className="text-sm text-gray-600">Restaurant, Hotel, Event</div>
                  </div>
                </label>
                
                <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedRole === 'receiver' ? 'border-trust-500 bg-trust-50' : 'border-gray-200'
                }`}>
                  <input
                    {...register('role')}
                    type="radio"
                    value="receiver"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-trust-500" />
                    <div className="font-medium">Receiver</div>
                    <div className="text-sm text-gray-600">NGO, Charity, Organization</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="input-field pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    className="input-field pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: value => value === watch('password') || 'Passwords do not match'
                    })}
                    type="password"
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Receiver Preferences */}
            {selectedRole === 'receiver' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Receiver Preferences</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Categories (select all that apply)
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beneficiary Count
                    </label>
                    <input
                      {...register('preferences.beneficiaryCount', { 
                        required: 'Beneficiary count is required',
                        min: { value: 1, message: 'Must be at least 1' }
                      })}
                      type="number"
                      className="input-field"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Radius (km)
                    </label>
                    <input
                      {...register('preferences.radiusKm', { 
                        required: 'Service radius is required',
                        min: { value: 1, message: 'Must be at least 1km' }
                      })}
                      type="number"
                      className="input-field"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 py-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}