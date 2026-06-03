const client = require("../../utils/twilio");
const SMSLog = require("../models/SMSLog");

exports.sendSMS = async ({
  userId,
  alertId = null,
  recipientName,
  recipientNumber,
  message,
  type
}) => {
  try {

    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: recipientNumber
    });

    await SMSLog.create({
      userId,
      alertId,
      recipientName,
      recipientNumber,
      type,
      status: "SENT",
      retryCount: 1, // 👈 ADD
      plivoMessageId: sms.sid
    });

  } catch (error) {

    await SMSLog.create({
      userId,
      alertId,
      recipientName,
      recipientNumber,
      type,
      status: "FAILED",
      retryCount: 1,
      failureReason: error.message
    });

    throw error;
  }
};