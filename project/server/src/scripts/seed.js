import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Donation from '../models/Donation.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodshare');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      name: 'System Admin',
      email: 'admin@foodshare.com',
      password: adminPassword,
      phone: '+1-555-0000',
      role: 'admin',
      location: {
        address: 'San Francisco, CA',
        coordinates: [37.7749, -122.4194]
      }
    });
    await admin.save();

    // Create sample donors
    const donorPassword = await bcrypt.hash('donor123', 12);
    const donors = [
      {
        name: 'Golden Gate Restaurant',
        email: 'manager@goldengate.com',
        password: donorPassword,
        phone: '+1-555-0101',
        role: 'donor',
        organizationName: 'Golden Gate Restaurant',
        location: {
          address: 'Downtown San Francisco, CA',
          coordinates: [37.7849, -122.4094]
        }
      },
      {
        name: 'Sunset Hotel',
        email: 'events@sunsethotel.com',
        password: donorPassword,
        phone: '+1-555-0102',
        role: 'donor',
        organizationName: 'Sunset Hotel & Events',
        location: {
          address: 'Mission District, San Francisco, CA',
          coordinates: [37.7599, -122.4148]
        }
      }
    ];

    for (const donorData of donors) {
      const donor = new User(donorData);
      await donor.save();
    }

    // Create sample receivers
    const receiverPassword = await bcrypt.hash('receiver123', 12);
    const receivers = [
      {
        name: 'Hope Foundation',
        email: 'coordinator@hope.org',
        password: receiverPassword,
        phone: '+1-555-0201',
        role: 'receiver',
        organizationName: 'Hope Foundation',
        location: {
          address: 'South Bay, San Francisco, CA',
          coordinates: [37.7649, -122.4194]
        },
        preferences: {
          foodCategories: ['Prepared Meals', 'Fresh Produce', 'Bakery Items'],
          beneficiaryCount: 100,
          radiusKm: 15
        }
      },
      {
        name: 'Community Kitchen',
        email: 'manager@communitykitchen.org',
        password: receiverPassword,
        phone: '+1-555-0202',
        role: 'receiver',
        organizationName: 'Community Kitchen',
        location: {
          address: 'Richmond District, San Francisco, CA',
          coordinates: [37.7849, -122.4794]
        },
        preferences: {
          foodCategories: ['Prepared Meals', 'Packaged Foods', 'Beverages'],
          beneficiaryCount: 75,
          radiusKm: 12
        }
      }
    ];

    for (const receiverData of receivers) {
      const receiver = new User(receiverData);
      await receiver.save();
    }

    console.log('✅ Seed data created successfully');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@foodshare.com / admin123');
    console.log('Donor: manager@goldengate.com / donor123');
    console.log('Receiver: coordinator@hope.org / receiver123');
    
  } catch (error) {
    console.error('❌ Seed data creation failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed script
connectDB().then(seedData);