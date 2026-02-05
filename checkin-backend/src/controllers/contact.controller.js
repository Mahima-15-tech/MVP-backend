const EmergencyContact = require("../models/EmergencyContact");

// ➕ Add contact
exports.addContact = async (req, res) => {
  const { name, phone, relation } = req.body;

  const contact = await EmergencyContact.create({
    userId: req.user.userId,
    name,
    phone,
    relation,
  });

  res.json({
    message: "Emergency contact added",
    contact,
  });
};

// 📄 Get all contacts of user
exports.getContacts = async (req, res) => {
  const contacts = await EmergencyContact.find({
    userId: req.user.userId,
  });

  res.json(contacts);
};

// ❌ Delete contact
exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  const contact = await EmergencyContact.findOneAndDelete({
    _id: id,
    userId: req.user.userId,
  });

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  res.json({
    message: "Contact removed",
  });
};
