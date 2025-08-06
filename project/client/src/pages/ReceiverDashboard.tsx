import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, MapPin, Users, Settings, Package, Clock } from 'lucide-react';
import DonationCard from '../components/DonationCard';
import ReceiverSettings from '../components/ReceiverSettings';
import axios from 'axios';

interface Donation {
  _id: string;
  foodType: string;
  quantity: number;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  donor: {
    name: string;
    phone: string;
    organizationName?: string;
  };
  expiryTime: string;
  status: 'available' | 'accepted' | 'completed' | 'expired';
  distance?: number;
  createdAt: string;
}

export default function ReceiverDashboard() {
  const { user } = useAuth();
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [acceptedDonations, setAcceptedDonations] = useState<Donation[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const [availableRes, acceptedRes] = await Promise.all([
        axios.get('/api/donations/available'),
        axios.get('/api/donations/accepted')
      ]);
      
      setAvailableDonations(availableRes.data.donations);
      setAcceptedDonations(acceptedRes.data.donations);
      setNotifications(availableRes.data.donations.length);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDonation = async (donationId: string) => {
    try {
      await axios.post(`/api/donations/${donationId}/accept`);
      await fetchDonations(); // Refresh data
    } catch (error: any) {
      console.error('Error accepting donation:', error);
    }
  };

  const handleMarkComplete = async (donationId: string) => {
    try {
      await axios.post(`/api/donations/${donationId}/complete`);
      await fetchDonations(); // Refresh data
    } catch (error: any) {
      console.error('Error marking donation complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Find and accept food donations in your area</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Donations</p>
              <p className="text-2xl font-bold text-accent-500">{availableDonations.length}</p>
            </div>
            <Package className="h-8 w-8 text-accent-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted Donations</p>
              <p className="text-2xl font-bold text-trust-500">{acceptedDonations.length}</p>
            </div>
            <Clock className="h-8 w-8 text-trust-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Service Radius</p>
              <p className="text-2xl font-bold text-primary-500">{user?.preferences?.radiusKm || 10} km</p>
            </div>
            <MapPin className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Available Donations */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Donations Near You
        </h2>
        
        {availableDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDonations.map(donation => (
              <DonationCard
                key={donation._id}
                donation={donation}
                isDonor={false}
                onAccept={() => handleAcceptDonation(donation._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations available</h3>
            <p className="text-gray-600">Check back later for new food donations in your area</p>
          </div>
        )}
      </div>

      {/* Accepted Donations */}
      {acceptedDonations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Accepted Donations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedDonations.map(donation => (
              <DonationCard
                key={donation._id}
                donation={donation}
                isDonor={false}
                onComplete={() => handleMarkComplete(donation._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ReceiverSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}