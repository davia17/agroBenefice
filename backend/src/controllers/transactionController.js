const Transaction = require('../models/Transaction');
const Campaign = require('../models/Campaign');
const Exploitation = require('../models/Exploitation');

const getTransactions = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.campaign) {
      filter.campaign = req.query.campaign;
    }
    // Possibilité de filtrer uniquement les charges globales (?global=true)
    if (req.query.global === 'true') {
      filter.campaign = { $exists: false };
    }

    const transactions = await Transaction.find(filter)
      .populate('campaign', 'name')
      .populate('parcel', 'name')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { campaign, parcel, type, category, amount, currency, date, description } = req.body;

    let exploitation = await Exploitation.findOne({ user: req.user._id });
    if (!exploitation) {
      return res.status(404).json({ message: "Exploitation introuvable." });
    }

    // Si une campagne est spécifiée, on vérifie qu'elle appartient bien à l'utilisateur
    if (campaign) {
      const validCampaign = await Campaign.findOne({ _id: campaign, user: req.user._id });
      if (!validCampaign) {
        return res.status(404).json({ message: "Campagne introuvable." });
      }
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      exploitation: exploitation._id,
      campaign: campaign || undefined,
      parcel: parcel || undefined,
      type,
      category,
      amount,
      currency: currency || 'MGA',
      date: date || Date.now(),
      description
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { campaign, parcel, type, category, amount, currency, date, description } = req.body;

    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée." });
    }

    if (campaign) {
      const validCampaign = await Campaign.findOne({ _id: campaign, user: req.user._id });
      if (!validCampaign) {
        return res.status(404).json({ message: "Campagne introuvable." });
      }
      transaction.campaign = campaign;
    } else if (campaign === null) {
      transaction.campaign = undefined;
    }

    transaction.parcel = parcel !== undefined ? parcel : transaction.parcel;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.currency = currency || transaction.currency;
    transaction.date = date || transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée." });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};