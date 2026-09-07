const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exploitation: { type: mongoose.Schema.Types.ObjectId, ref: 'Exploitation', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }, // Optionnel : null si c'est une charge générale / investissement pluriannuel
  parcel: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcel' },     // Optionnel : si ciblé sur une parcelle
  type: { type: String, enum: ['EXPENSE', 'INCOME'], required: true },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'SEEDS', 'FERTILIZER', 'PESTICIDE', 'LABOR', 'FUEL', 
      'EQUIPMENT_PURCHASE', // Achat de matériel (tracteur, etc.)
      'MAINTENANCE',        // Réparation / Maintenance
      'GENERAL_OVERHEAD',   // Frais généraux (loyers, assurances, etc.)
      'HARVEST_SALE', 
      'OTHER'
    ] 
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'MGA' },
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);