const ParcelCampaign = require('../models/ParcelCampaign');
const Campaign = require('../models/Campaign');
const Parcel = require('../models/Parcel');

// Récupérer toutes les affectations (ou filtrer par campagne : ?campaign=ID)
const getParcelCampaigns = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.campaign) {
      filter.campaign = req.query.campaign;
    }

    const assignments = await ParcelCampaign.find(filter)
      .populate('campaign', 'name status startDate endDate')
      .populate('parcel', 'name surface unit');

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assigner une culture à une parcelle pour une campagne
const createParcelCampaign = async (req, res) => {
  try {
    const { campaign, parcel, cropName, cultivatedSurface, status, notes } = req.body;

    const validCampaign = await Campaign.findOne({ _id: campaign, user: req.user._id });
    const validParcel = await Parcel.findOne({ _id: parcel, user: req.user._id });

    if (!validCampaign || !validParcel) {
      return res.status(404).json({ message: "Campagne ou parcelle introuvable." });
    }

    if (cultivatedSurface > validParcel.surface) {
      return res.status(400).json({ 
        message: `La surface cultivée (${cultivatedSurface}) ne peut pas dépasser la surface totale de la parcelle (${validParcel.surface} ${validParcel.unit}).` 
      });
    }

    const assignment = await ParcelCampaign.create({
      user: req.user._id,
      campaign,
      parcel,
      cropName,
      cultivatedSurface,
      status: status || 'PLANNED',
      notes
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Cette parcelle est déjà assignée à cette campagne." });
    }
    res.status(500).json({ message: error.message });
  }
};

// Modifier une affectation (ex: changer la culture ou le statut)
const updateParcelCampaign = async (req, res) => {
  try {
    const { cropName, cultivatedSurface, status, notes } = req.body;

    const assignment = await ParcelCampaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({ message: "Affectation non trouvée." });
    }

    if (cultivatedSurface !== undefined) {
      const Parcel = require('../models/Parcel');
      const parcel = await Parcel.findOne({ _id: assignment.parcel, user: req.user._id });
      if (parcel && cultivatedSurface > parcel.surface) {
        return res.status(400).json({ 
          message: `La surface cultivée (${cultivatedSurface}) ne peut pas dépasser la surface totale de la parcelle (${parcel.surface} ${parcel.unit}).` 
        });
      }
      assignment.cultivatedSurface = cultivatedSurface;
    }

    assignment.cropName = cropName || assignment.cropName;
    assignment.status = status || assignment.status;
    assignment.notes = notes !== undefined ? notes : assignment.notes;

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une affectation
const deleteParcelCampaign = async (req, res) => {
  try {
    const assignment = await ParcelCampaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!assignment) {
      return res.status(404).json({ message: "Affectation non trouvée." });
    }

    await assignment.deleteOne();
    res.json({ message: "Affectation supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParcelCampaigns,
  createParcelCampaign,
  updateParcelCampaign,
  deleteParcelCampaign
};