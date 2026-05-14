const SMSLog = require("../models/SMSLog");
const { sendSMS } = require("../services/smsService");

exports.retryFailedSMS = async () => {

  const failed = await SMSLog.find({
    status: "FAILED",
    retryCount: { $lt: 5 }
  });

  for (let sms of failed) {

    try {
      await sendSMS({
        userId: sms.userId,
        recipientName: sms.recipientName,
        recipientNumber: sms.recipientNumber,
        message: "Retry message",
        type: sms.type
      });

      sms.retryCount += 1;
      sms.status = "SENT";
      await sms.save();

    } catch (err) {
      sms.retryCount += 1;
      await sms.save();
    }
  }
};