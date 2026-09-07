const mongoose = require('mongoose');

const ParcelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exploitation: { type: mongoose.Schema.Types.ObjectId, ref: 'Exploitation', required: true },
  name: { type: String, required: true, trim: true },
  surface: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['ha', 'ares', 'm2'], default: 'ha' },
  location: { type: String, trim: true },
  status: { type: String, enum: ['ACTIVE', 'FALLOW', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', ParcelSchema);