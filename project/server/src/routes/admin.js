import express from 'express';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get dashboard statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalReceivers,
      totalDonations,
      activeDonations,
      completedDonations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'receiver' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: { $in: ['available', 'accepted'] } }),
      Donation.countDocuments({ status: 'completed' })
    ]);

    // Calculate total meals served and waste reduced
    const completedDonationsData = await Donation.find({ status: 'completed' });
    const totalMealsServed = completedDonationsData.reduce((sum, d) => sum + d.quantity, 0);
    const wasteReduced = Math.round(totalMealsServed * 0.5); // Estimate 0.5kg per serving

    res.json({
      totalUsers,
      totalDonors,
      totalReceivers,
      totalDonations,
      activeDonations,
      completedDonations,
      totalMealsServed,
      wasteReduced
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get recent activity
router.get('/activity', auth, adminAuth, async (req, res) => {
  try {
    // This would typically come from an activity log collection
    // For now, we'll generate sample data
    const activity = [
      {
        _id: '1',
        type: 'donation_created',
        description: 'New donation: 50 prepared meals posted by Restaurant ABC',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        user: 'Restaurant ABC'
      },
      {
        _id: '2',
        type: 'donation_accepted',
        description: 'Donation accepted by Hope Foundation',
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        user: 'Hope Foundation'
      },
      {
        _id: '3',
        type: 'user_registered',
        description: 'New receiver organization registered: Local Food Bank',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        user: 'Local Food Bank'
      },
      {
        _id: '4',
        type: 'donation_completed',
        description: 'Donation completed: 30 meals delivered to Community Center',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: 'Community Center'
      }
    ];

    res.json({ activity });
  } catch (error) {
    console.error('Admin activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

export default router;