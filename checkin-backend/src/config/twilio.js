const twilio = require("twilio");
const Settings = require("../models/Settings");

let twilioClient = null;
let currentSid = null;
let currentToken = null;

const getTwilioClient = async () => {
  const settings = await Settings.findOne();

  const accountSid =
    settings?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;

  const authToken =
    settings?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }


  if (
    !twilioClient ||
    currentSid !== accountSid ||
    currentToken !== authToken
  ) {
    twilioClient = twilio(accountSid, authToken);

    currentSid = accountSid;
    currentToken = authToken;

    console.log("✅ Twilio client initialized/updated");
  }

  return twilioClient;
};

module.exports = {
  getTwilioClient
};