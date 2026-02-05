const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  addContact,
  getContacts,
  deleteContact,
} = require("../controllers/contact.controller");

router.post("/", auth, addContact);
router.get("/", auth, getContacts);
router.delete("/:id", auth, deleteContact);

module.exports = router;
