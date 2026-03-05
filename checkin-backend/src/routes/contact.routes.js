const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
  
} = require("../controllers/contact.controller");

router.post("/", auth, addContact);
router.get("/", auth, getContacts);
router.put("/:id", auth, updateContact);
router.delete("/:id", auth, deleteContact);

module.exports = router;
