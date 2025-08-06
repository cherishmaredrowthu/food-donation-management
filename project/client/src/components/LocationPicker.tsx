import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (coords: [number, number]) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const map = useMapEvents({
    click(e) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      onLocationSelect(coords);
    },
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setPosition(coords);
        map.flyTo(coords, 13);
        onLocationSelect(coords);
      },
      () => {
        // Default to San Francisco if geolocation fails
        const coords: [number, number] = [37.7749, -122.4194];
        setPosition(coords);
        map.setView(coords, 13);
      }
    );
  }, [map, onLocationSelect]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [address, setAddress] = useState('');

  const handleMapLocationSelect = async (coordinates: [number, number]) => {
    try {
      // Reverse geocoding using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates[0]}&lon=${coordinates[1]}`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || `${coordinates[0]}, ${coordinates[1]}`;
      
      setAddress(formattedAddress);
      onLocationSelect({ address: formattedAddress, coordinates });
    } catch (error) {
      const formattedAddress = `${coordinates[0]}, ${coordinates[1]}`;
      setAddress(formattedAddress);
      onLocationSelect({ address: formattedAddress, coordinates });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field pl-10"
          placeholder="Click on map or enter address"
          readOnly
        />
      </div>
      
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleMapLocationSelect} />
        </MapContainer>
      </div>
      
      <p className="text-sm text-gray-600">
        Click anywhere on the map to set your location, or allow location access for automatic detection.
      </p>
    </div>
  );
}