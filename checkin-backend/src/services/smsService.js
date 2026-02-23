async function sendSMS(phone, message) {
    console.log("📨 Sending SMS to:", phone);
  
    // simulate random success/fail
    const success = true;
  
    if (success) {
      console.log("✅ SMS Sent");
      return { success: true };
    } else {
      console.log("❌ SMS Failed");
      return { success: false, error: "Network error" };
    }
  }
  
  module.exports = { sendSMS };
  