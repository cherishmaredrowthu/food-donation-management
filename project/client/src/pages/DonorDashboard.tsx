import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, MapPin, Clock, Package, Phone, History } from 'lucide-react';
import CreateDonationModal from '../components/CreateDonationModal';
import DonationCard from '../components/DonationCard';
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
  expiryTime: string;
  status: 'available' | 'accepted' | 'completed' | 'expired';
  acceptedBy?: {
    name: string;
    phone: string;
    organization: string;
  };
  createdAt: string;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/api/donations/my-donations');
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationCreated = (newDonation: Donation) => {
    setDonations(prev => [newDonation, ...prev]);
    setShowCreateModal(false);
  };

  const activeDonations = donations.filter(d => ['available', 'accepted'].includes(d.status));
  const pastDonations = donations.filter(d => ['completed', 'expired'].includes(d.status));

  const stats = {
    totalDonations: donations.length,
    activeDonations: activeDonations.length,
    completedDonations: donations.filter(d => d.status === 'completed').length,
    peopleHelped: donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + (d.quantity || 0), 0)
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Manage your food donations and help reduce waste</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Donation</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
            <Package className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-accent-500">{stats.activeDonations}</p>
            </div>
            <Clock className="h-8 w-8 text-accent-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-primary-500">{stats.completedDonations}</p>
            </div>
            <History className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">People Helped</p>
              <p className="text-2xl font-bold text-trust-500">{stats.peopleHelped}</p>
            </div>
            <Package className="h-8 w-8 text-trust-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Donations ({activeDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History ({pastDonations.length})
        </button>
      </div>

      {/* Donations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'active' ? activeDonations : pastDonations).map(donation => (
          <DonationCard key={donation._id} donation={donation} isDonor={true} />
        ))}
      </div>

      {(activeTab === 'active' ? activeDonations : pastDonations).length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' ? 'No active donations' : 'No donation history'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'active' 
              ? 'Create your first donation to help reduce food waste'
              : 'Your completed and expired donations will appear here'
            }
          </p>
        </div>
      )}

      {/* Create Donation Modal */}
      {showCreateModal && (
        <CreateDonationModal
          onClose={() => setShowCreateModal(false)}
          onDonationCreated={handleDonationCreated}
        />
      )}
    </div>
  );
}