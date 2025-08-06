import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'receiver', 'admin'],
    required: true
  },
  organizationName: {
    type: String,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Coordinates must be an array of [latitude, longitude]'
      }
    }
  },
  preferences: {
    foodCategories: [{
      type: String,
      enum: ['Prepared Meals', 'Fresh Produce', 'Bakery Items', 'Dairy Products', 
             'Packaged Foods', 'Beverages', 'Frozen Items', 'Snacks']
    }],
    beneficiaryCount: {
      type: Number,
      min: 1
    },
    radiusKm: {
      type: Number,
      min: 1,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastDonationReceived: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);