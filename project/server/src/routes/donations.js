import express from 'express';
import { body, validationResult } from 'express-validator';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { findEligibleReceivers } from '../services/matching.js';
import { sendDonationNotification } from '../services/email.js';
import { sendDonationUpdateEmail } from '../services/email.js';

const router = express.Router();

// Create donation
router.post('/', auth, [
  body('foodType').isIn(['Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
                        'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks', 'Other']),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('description').trim().isLength({ min: 10, max: 500 }),
  body('expiryTime').isISO8601().withMessage('Invalid expiry time'),
  body('location.address').trim().notEmpty(),
  body('location.coordinates').isArray({ min: 2, max: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // Verify user is a donor
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can create donations' });
    }

    // Check if expiry time is in the future
    const expiryTime = new Date(req.body.expiryTime);
    if (expiryTime <= new Date()) {
      return res.status(400).json({ message: 'Expiry time must be in the future' });
    }

    const donation = new Donation({
      ...req.body,
      donor: req.user.userId
    });

    await donation.save();
    await donation.populate('donor', 'name phone organizationName');

    // Find eligible receivers and send notifications
    const eligibleReceivers = await findEligibleReceivers(donation);
    
    // Send email notifications to eligible receivers
    for (const receiver of eligibleReceivers) {
      try {
        await sendDonationNotification(donation, receiver);
        donation.notifiedReceivers.push({
          receiver: receiver._id,
          notifiedAt: new Date()
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${receiver.email}:`, emailError);
      }
    }

    await donation.save();

    res.status(201).json({
      message: 'Donation created successfully',
      donation,
      notifiedCount: eligibleReceivers.length
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error creating donation' });
  }
});

// Get donations for donor
router.get('/my-donations', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can view their donations' });
    }

    const donations = await Donation.find({ donor: req.user.userId })
      .populate('acceptedBy', 'name phone organizationName')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// Get available donations for receiver
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receiver') {
      return res.status(403).json({ message: 'Only receivers can view available donations' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find donations within radius and matching preferences
    const donations = await Donation.find({
      status: 'available',
      expiryTime: { $gt: new Date() },
      foodType: { $in: user.preferences?.foodCategories || [] },
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [
            user.location.coordinates,
            (user.preferences?.radiusKm || 10) / 6371 // Convert km to radians
          ]
        }
      }
    })
    .populate('donor', 'name phone organizationName')
    .sort({ createdAt: -1 });

    // Calculate distances
    const { getDistance } = await import('geolib');
    const donationsWithDistance = donations.map(donation => ({
      ...donation.toObject(),
      distance: getDistance(
        { latitude: user.location.coordinates[0], longitude: user.location.coordinates[1] },
        { latitude: donation.location.coordinates[0], longitude: donation.location.coordinates[1] }
      ) / 1000 // Convert to km
    }));

    res.json({ donations: donationsWithDistance });
  } catch (error) {
    console.error('Fetch available donations error:', error);
    res.status(500).json({ message: 'Server error fetching available donations' });
  }
});

// Get accepted donations for receiver
router.get('/accepted', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receiver') {
      return res.status(403).json({ message: 'Only receivers can view accepted donations' });
    }

    const donations = await Donation.find({
      acceptedBy: req.user.userId,
      status: { $in: ['accepted'] }
    })
    .populate('donor', 'name phone organizationName')
    .sort({ acceptedAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Fetch accepted donations error:', error);
    res.status(500).json({ message: 'Server error fetching accepted donations' });
  }
});

// Accept donation
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'receiver') {
      return res.status(403).json({ message: 'Only receivers can accept donations' });
    }

    const donation = await Donation.findById(req.params.id).populate('donor', 'email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is no longer available' });
    }

    if (donation.expiryTime <= new Date()) {
      return res.status(400).json({ message: 'Donation has expired' });
    }

    // Update donation status
    donation.status = 'accepted';
    donation.acceptedBy = req.user.userId;
    donation.acceptedAt = new Date();

    await donation.save();

    // Update receiver's last donation received timestamp
    await User.findByIdAndUpdate(req.user.userId, {
      lastDonationReceived: new Date()
    });

    const receiver = await User.findById(req.user.userId);
    await sendDonationUpdateEmail(donation, receiver, 'accepted');

    res.json({ message: 'Donation accepted successfully', donation });
  } catch (error) {
    console.error('Accept donation error:', error);
    res.status(500).json({ message: 'Server error accepting donation' });
  }
});

// Mark donation as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check permissions
    const canComplete = req.user.role === 'receiver' && 
                       donation.acceptedBy?.toString() === req.user.userId;
    
    if (!canComplete) {
      return res.status(403).json({ message: 'Not authorized to complete this donation' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Donation is not in accepted state' });
    }

    donation.status = 'completed';
    donation.completedAt = new Date();
    await donation.save();

    await sendDonationUpdateEmail(donation, receiver, 'completed');
    res.json({ message: 'Donation marked as completed', donation });
  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({ message: 'Server error completing donation' });
  }
});

// Get donation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name phone organizationName')
      .populate('acceptedBy', 'name phone organizationName');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check permissions
    const canView = donation.donor.toString() === req.user.userId ||
                   donation.acceptedBy?.toString() === req.user.userId ||
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Not authorized to view this donation' });
    }

    res.json({ donation });
  } catch (error) {
    console.error('Fetch donation error:', error);
    res.status(500).json({ message: 'Server error fetching donation' });
  }
});




export default router;