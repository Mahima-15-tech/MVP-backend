const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { createTicket, getAllTickets , updateTicket, replyTicket, getUnreadCount} = require("../controllers/support.controller");
const upload = require("../middleware/upload");

router.post("/", auth, upload.single("file"), createTicket);

router.post("/", auth, createTicket);
router.get("/", getAllTickets);
router.put("/:id", updateTicket);
router.post("/:id/reply", replyTicket);
router.get("/unread-count", getUnreadCount);
module.exports = router;