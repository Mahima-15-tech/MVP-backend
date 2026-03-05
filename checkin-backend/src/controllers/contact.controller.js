const EmergencyContact = require("../models/EmergencyContact");
const ContactHistory = require("../models/ContactHistory");
const Subscription = require("../models/subscription");
const { formatPhone } = require("../../utils/phoneFormatter");

// ➕ Add contact
exports.addContact = async (req, res) => {
  try {

    const { name, phone, relation } = req.body;
    const userId = req.user.userId;

    // 🔹 Format phone to E.164 (+65...)
    const formattedPhone = formatPhone(phone);

    if (!formattedPhone) {
      return res.status(400).json({
        message: "Invalid contact phone number"
      });
    }

    // 🔹 Get Subscription
    const sub = await Subscription.findOne({ userId });

    if (!sub || sub.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Active subscription required"
      });
    }

    // 🔹 Determine Limit
    let maxContacts = 1;

    if (sub.planType === "MONTHLY" || sub.planType === "YEARLY") {
      maxContacts = 2;
    }

    // Count only active contacts
    const existingCount = await EmergencyContact.countDocuments({ userId });

    if (existingCount >= maxContacts) {
      return res.status(400).json({
        message: `Contact limit reached (${maxContacts})`
      });
    }

    // 🔹 Prevent duplicate number
    const duplicate = await EmergencyContact.findOne({
      userId,
      phone: formattedPhone
    });

    if (duplicate) {
      return res.status(400).json({
        message: "This contact number already exists"
      });
    }

    const contact = await EmergencyContact.create({
      userId,
      name,
      phone: formattedPhone,
      relation,
    });

    // 🔥 History Entry
    await ContactHistory.create({
      userId,
      name,
      phone: formattedPhone,
      relation,
      action: "ADDED"
    });

    res.json({
      message: "Emergency contact added",
      contact,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📄 Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      userId: req.user.userId,
    });

    res.json(contacts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✏️ Update contact
exports.updateContact = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, phone, relation } = req.body;
    const userId = req.user.userId;

    const contact = await EmergencyContact.findOne({
      _id: id,
      userId
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // 🔹 Save OLD data in history
    await ContactHistory.create({
      userId,
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      action: "UPDATED"
    });

    // 🔹 If phone is being updated → reformat
    let updatedPhone = contact.phone;

    if (phone) {
      const formattedPhone = formatPhone(phone);

      if (!formattedPhone) {
        return res.status(400).json({
          message: "Invalid contact phone number"
        });
      }

      updatedPhone = formattedPhone;
    }

    contact.name = name || contact.name;
    contact.phone = updatedPhone;
    contact.relation = relation || contact.relation;

    await contact.save();

    res.json({
      message: "Contact updated successfully",
      contact
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ❌ Delete contact
exports.deleteContact = async (req, res) => {
  try {

    const { id } = req.params;
    const userId = req.user.userId;

    const contact = await EmergencyContact.findOneAndDelete({
      _id: id,
      userId
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // 🔥 Save History
    await ContactHistory.create({
      userId,
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      action: "DELETED"
    });

    res.json({ message: "Contact removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};