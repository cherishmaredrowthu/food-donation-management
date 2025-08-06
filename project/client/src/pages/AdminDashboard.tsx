import React, { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, MapPin, Activity, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  totalReceivers: number;
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalMealsServed: number;
  wasteReduced: number;
}

interface RecentActivity {
  _id: string;
  type: 'donation_created' | 'donation_accepted' | 'donation_completed' | 'user_registered';
  description: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDonors: 0,
    totalReceivers: 0,
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalMealsServed: 0,
    wasteReduced: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/activity')
      ]);
      
      setStats(statsRes.data);
      setRecentActivity(activityRes.data.activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor platform performance and user activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalDonors} donors, {stats.totalReceivers} receivers
              </p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-accent-500">{stats.totalDonations}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeDonations} active
              </p>
            </div>
            <Package className="h-8 w-8 text-accent-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meals Served</p>
              <p className="text-2xl font-bold text-trust-500">{stats.totalMealsServed}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedDonations} completed donations
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-trust-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waste Reduced</p>
              <p className="text-2xl font-bold text-green-500">{stats.wasteReduced} kg</p>
              <p className="text-xs text-gray-500 mt-1">
                Environmental impact
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'donation_created' && <Package className="h-5 w-5 text-accent-500" />}
                    {activity.type === 'donation_accepted' && <MapPin className="h-5 w-5 text-trust-500" />}
                    {activity.type === 'donation_completed' && <TrendingUp className="h-5 w-5 text-green-500" />}
                    {activity.type === 'user_registered' && <Users className="h-5 w-5 text-primary-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">System Status</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Email Service</span>
              </div>
              <span className="text-sm text-blue-600">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Matching Algorithm</span>
              </div>
              <span className="text-sm text-yellow-600">Optimized</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Average Response Time</span>
              </div>
              <span className="text-sm text-gray-600">2.3 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}