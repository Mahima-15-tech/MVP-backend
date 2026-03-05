exports.getSystemHealth = async (req, res) => {
    try {
  
      // Example logic
      const smsConnected = true; // check your SMS provider status
      const serverRunning = true;
  
      res.json({
        smsStatus: smsConnected ? "Connected" : "Disconnected",
        serverStatus: serverRunning ? "Running" : "Down",
        failedSMS24h: 3
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };