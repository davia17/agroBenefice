const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exploitation: { type: mongoose.Schema.Types.ObjectId, ref: 'Exploitation', required: true },
  name: { type: String, required: true, trim: true }, // Ex: "Campagne Riz 2026"
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'CLOSED'], default: 'ACTIVE' },
  description: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);