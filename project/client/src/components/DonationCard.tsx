import React from 'react';
import { MapPin, Clock, Package, Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface Donation {
  _id: string;
  foodType: string;
  quantity: number;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  donor?: {
    name: string;
    phone: string;
    organizationName?: string;
  };
  acceptedBy?: {
    name: string;
    phone: string;
    organization: string;
  };
  expiryTime: string;
  status: 'available' | 'accepted' | 'completed' | 'expired';
  distance?: number;
  createdAt: string;
}

interface DonationCardProps {
  donation: Donation;
  isDonor: boolean;
  onAccept?: () => void;
  onComplete?: () => void;
}

export default function DonationCard({ donation, isDonor, onAccept, onComplete }: DonationCardProps) {
  const expiryDate = new Date(donation.expiryTime);
  const now = new Date();
  const timeUntilExpiry = expiryDate.getTime() - now.getTime();
  const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
  const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
  
  const isExpiringSoon = timeUntilExpiry < 2 * 60 * 60 * 1000; // Less than 2 hours
  const isExpired = timeUntilExpiry <= 0;

  const getStatusColor = () => {
    switch (donation.status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openMapsLink = () => {
    const [lat, lng] = donation.location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`card transition-all duration-200 ${
      isExpiringSoon && !isExpired ? 'border-yellow-300 bg-yellow-50' : ''
    } ${isExpired ? 'border-red-300 bg-red-50 opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{donation.foodType}</h3>
          <p className="text-sm text-gray-600">{donation.quantity} servings</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {donation.status}
          </span>
          {isExpiringSoon && !isExpired && (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4">{donation.description}</p>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{donation.location.address}</span>
          {donation.distance && (
            <span className="text-primary-600 font-medium">({donation.distance.toFixed(1)} km)</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4" />
          <span className={isExpiringSoon ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
            {isExpired ? 'Expired' : 
             `${hoursUntilExpiry}h ${minutesUntilExpiry}m remaining`}
          </span>
        </div>

        {/* Contact Info */}
        {!isDonor && donation.donor && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{donation.donor.name} - {donation.donor.phone}</span>
          </div>
        )}

        {isDonor && donation.acceptedBy && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{donation.acceptedBy.name} - {donation.acceptedBy.phone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={openMapsLink}
          className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
        >
          <MapPin className="h-4 w-4" />
          <span>View Location</span>
        </button>

        {!isDonor && donation.status === 'available' && !isExpired && onAccept && (
          <button
            onClick={onAccept}
            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
          >
            <Package className="h-4 w-4" />
            <span>Accept</span>
          </button>
        )}

        {!isDonor && donation.status === 'accepted' && onComplete && (
          <button
            onClick={onComplete}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg flex items-center justify-center space-x-1 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark Complete</span>
          </button>
        )}
      </div>
    </div>
  );
}