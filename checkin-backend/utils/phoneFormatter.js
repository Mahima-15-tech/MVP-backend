const { parsePhoneNumberFromString } = require("libphonenumber-js");

function formatPhone(countryCode, phone) {

  if (!phone || !countryCode) return null;

  try {

    const fullNumber = `${countryCode}${phone}`;

    const parsed = parsePhoneNumberFromString(fullNumber);

    // agar parse ho gaya to formatted return karo
    if (parsed) {
      return parsed.number;
    }

    // agar parse fail ho jaye to bhi raw number return karo
    return fullNumber;

  } catch (error) {

    // fallback
    return `${countryCode}${phone}`;
  }
}

module.exports = { formatPhone };