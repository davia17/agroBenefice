const Parcel = require('../models/Parcel');
const Exploitation = require('../models/Exploitation');

const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ user: req.user._id });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createParcel = async (req, res) => {
  try {
    const { name, surface, unit, location, description, status } = req.body;

    let exploitation = await Exploitation.findOne({ user: req.user._id });
    if (!exploitation) {
      exploitation = await Exploitation.create({
        user: req.user._id,
        name: `Exploitation de ${req.user.name}`
      });
    }

    const parcel = await Parcel.create({
      user: req.user._id,
      exploitation: exploitation._id,
      name,
      surface,
      unit: unit || 'ha',
      location,
      description,
      status: status || 'ACTIVE'
    });

    res.status(201).json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateParcel = async (req, res) => {
  try {
    const { name, surface, unit, location, description, status } = req.body;
    const parcel = await Parcel.findOne({ _id: req.params.id, user: req.user._id });
    if (!parcel) {
      return res.status(404).json({ message: "Parcelle non trouvée." });
    }
    parcel.name = name || parcel.name;
    parcel.surface = surface !== undefined ? surface : parcel.surface;
    parcel.unit = unit || parcel.unit;
    parcel.location = location !== undefined ? location : parcel.location;
    parcel.description = description !== undefined ? description : parcel.description;
    parcel.status = status || parcel.status;

    const updatedParcel = await parcel.save();
    res.json(updatedParcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ _id: req.params.id, user: req.user._id });
    if (!parcel) {
      return res.status(404).json({ message: "Parcelle non trouvée." });
    }

    await parcel.deleteOne();
    res.json({ message: "Parcelle supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getParcels, createParcel, updateParcel, deleteParcel };