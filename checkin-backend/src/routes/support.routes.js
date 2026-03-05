const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { createTicket, getAllTickets , updateTicket, replyTicket, getUnreadCount} = require("../controllers/support.controller");

router.post("/", auth, createTicket);
router.get("/", getAllTickets);
router.put("/:id", updateTicket);
router.post("/:id/reply", replyTicket);
router.get("/unread-count", getUnreadCount);
module.exports = router;