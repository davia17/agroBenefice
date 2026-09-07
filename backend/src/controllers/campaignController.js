const Campaign = require('../models/Campaign');
const Exploitation = require('../models/Exploitation');

// Récupérer toutes les campagnes de l'utilisateur
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id }).sort({ startDate: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle campagne
const createCampaign = async (req, res) => {
  try {
    const { name, startDate, endDate, status, description } = req.body;

    // Récupérer l'exploitation de l'utilisateur
    let exploitation = await Exploitation.findOne({ user: req.user._id });
    if (!exploitation) {
      exploitation = await Exploitation.create({
        user: req.user._id,
        name: `Exploitation de ${req.user.name}`
      });
    }

    const campaign = await Campaign.create({
      user: req.user._id,
      exploitation: exploitation._id,
      name,
      startDate,
      endDate,
      status: status || 'ACTIVE',
      description
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une campagne (ex: la clôturer)
const updateCampaign = async (req, res) => {
  try {
    const { name, startDate, endDate, status, description } = req.body;

    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) {
      return res.status(404).json({ message: "Campagne non trouvée." });
    }

    campaign.name = name || campaign.name;
    campaign.startDate = startDate || campaign.startDate;
    campaign.endDate = endDate !== undefined ? endDate : campaign.endDate;
    campaign.status = status || campaign.status;
    campaign.description = description !== undefined ? description : campaign.description;

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une campagne
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) {
      return res.status(404).json({ message: "Campagne non trouvée." });
    }

    await campaign.deleteOne();
    res.json({ message: "Campagne supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign
};