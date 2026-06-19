const Settings = require("../src/models/Settings");
const twilio = require("twilio");

exports.getTwilioClient = async () => {

  const settings = await Settings.findOne();

  if (!settings || !settings.twilioAccountSid || !settings.twilioAuthToken) {
    throw new Error("Twilio keys not configured");
  }

  return twilio(
    settings.twilioAccountSid,
    settings.twilioAuthToken
  );
};