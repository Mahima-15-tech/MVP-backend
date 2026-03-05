exports.triggerTestMissedCheckin = async (req, res) => {
    try {
      // simulate alert creation
      console.log("Test Missed Check-in Triggered");
  
      res.json({ message: "Test Missed Check-in Alert Sent" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.triggerTestSOS = async (req, res) => {
    try {
      console.log("Test SOS Triggered");
  
      res.json({ message: "Test SOS Alert Sent" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };