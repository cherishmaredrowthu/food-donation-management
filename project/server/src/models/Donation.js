import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    required: true,
    enum: ['Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products',
           'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [latitude, longitude]
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Coordinates must be an array of [latitude, longitude]'
      }
    }
  },
  expiryTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Expiry time must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'completed', 'expired'],
    default: 'available'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notifiedReceivers: [{
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notifiedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });
donationSchema.index({ status: 1, expiryTime: 1 });
donationSchema.index({ donor: 1, createdAt: -1 });

// Auto-expire donations
donationSchema.pre('save', function(next) {
  if (this.expiryTime < new Date() && this.status === 'available') {
    this.status = 'expired';
  }
  next();
});

export default mongoose.model('Donation', donationSchema);