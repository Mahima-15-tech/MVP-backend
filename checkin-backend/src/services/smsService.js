const { getTwilioClient } = require("../../utils/twilio");
const SMSLog = require("../models/SMSLog");

exports.sendSMS = async ({
  userId,
  alertId = null,
  recipientName,
  recipientNumber,
  message,
  type,
  retryCount = 1
}) => {
  try {
    const client = await getTwilioClient();

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
      twilioMessageId: sms.sid,
      retryCount
    });

  } catch (error) {

    await SMSLog.create({
      userId,
      alertId,
      recipientName,
      recipientNumber,
      type,
      status: "FAILED",
      retryCount,
      failureReason: error.message
    });

    throw error;
  }
};