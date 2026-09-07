const mongoose = require('mongoose');

const ParcelCampaignSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  parcel: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcel', required: true },
  cropName: { type: String, required: true, trim: true }, // Ex: "Riz pluvial", "Maïs", "Haricot"
  cultivatedSurface: { type: Number, required: true, min: 0 }, // Surface dédiée à cette culture sur la parcelle
  status: { type: String, enum: ['PLANNED', 'GROWING', 'HARVESTED', 'FAILED'], default: 'PLANNED' },
  notes: { type: String, trim: true }
}, { timestamps: true });

ParcelCampaignSchema.index({ campaign: 1, parcel: 1 }, { unique: true });

module.exports = mongoose.model('ParcelCampaign', ParcelCampaignSchema);