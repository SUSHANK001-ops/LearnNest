import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9.-]+$/, 'Domain can only contain lowercase letters, numbers, hyphens, and dots']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
institutionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Institution = mongoose.model('Institution', institutionSchema);
export default Institution;
