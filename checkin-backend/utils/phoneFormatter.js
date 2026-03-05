const { parsePhoneNumberFromString } = require("libphonenumber-js");

exports.formatPhone = (phone) => {
  try {

    if (!phone) return null;

    // remove spaces, brackets, dashes
    phone = phone
      .toString()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    // parse phone
    const phoneNumber = parsePhoneNumberFromString(phone, "SG"); 
    // default country Singapore

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null;
    }

    // return international format
    return phoneNumber.number;

  } catch (err) {
    return null;
  }
};