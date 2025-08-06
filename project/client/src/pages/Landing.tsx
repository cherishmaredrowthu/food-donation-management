import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, MapPin, Clock, Shield, Award } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">FoodShare</span>
            </div>
            
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Reducing Food Waste,<br />
            <span className="text-primary-500">Feeding Communities</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect restaurants, hotels, and event organizers with NGOs and charitable organizations 
            to ensure surplus food reaches those who need it most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=donor" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              I'm a Food Donor
            </Link>
            <Link to="/register?role=receiver" className="bg-trust-500 hover:bg-trust-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              I'm a Receiver
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How FoodShare Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Location-Based Matching</h3>
              <p className="text-gray-600">
                Smart algorithm matches food donations with nearby receivers based on location, capacity, and preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Notifications</h3>
              <p className="text-gray-600">
                Instant email alerts ensure receivers can quickly respond to time-sensitive food donations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-trust-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-trust-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fair Distribution</h3>
              <p className="text-gray-600">
                Ensures equitable food distribution through rotation and preference-based matching system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">2,500+</div>
              <div className="text-gray-300">Meals Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-400 mb-2">150+</div>
              <div className="text-gray-300">Partner Restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-trust-400 mb-2">80+</div>
              <div className="text-gray-300">NGO Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="h-6 w-6 text-primary-500" />
            <span className="text-lg font-semibold text-gray-900">FoodShare</span>
          </div>
          <p className="text-gray-600">
            © 2025 FoodShare. Together, we're building a world without food waste.
          </p>
        </div>
      </footer>
    </div>
  );
}