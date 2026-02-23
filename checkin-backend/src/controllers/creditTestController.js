const { getUserBalance, deductCredit } = require("../services/creditService");

exports.getBalance = async (req, res) => {
  try {
    const balance = await getUserBalance(req.user.userId);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.testDeduct = async (req, res) => {
  try {
    const balance = await deductCredit(req.user.userId, "MISSED_ALERT");
    res.json({ newBalance: balance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
