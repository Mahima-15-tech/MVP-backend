exports.getSystemHealth = async (req, res) => {
    try {
  
      // Example logic
      const smsConnected = false; // check your SMS provider status
      const serverRunning = true;
  
      res.json({
        smsStatus: smsConnected ? "Online" : "Offline",
        serverStatus: serverRunning ? "Running" : "Stopped",
        failedSMS24h: 3
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };