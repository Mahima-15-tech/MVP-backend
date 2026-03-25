const mongoose = require("mongoose");
const CreditTransaction = require("../models/creditTransaction");
const Subscription = require("../models/subscription");

/**
 * Get latest balance safely
 */
async function getUserBalance(userId, session = null) {
  const lastTx = await CreditTransaction
    .findOne({ userId })
    .sort({ createdAt: -1 })
    .session(session);

  return lastTx ? lastTx.balanceAfter : 0;
}

/**
 * Add credits
 */
async function addCredits(userId, amount, reason) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentBalance = await getUserBalance(userId , session);
    const newBalance = currentBalance + amount;

    await CreditTransaction.create([{
      userId,
      type: "ADD",
      reason,
      amount,
      balanceAfter: newBalance,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return newBalance;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

/**
 * Deduct one credit
 */
async function deductCredit(userId, reason) {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentBalance = await getUserBalance(userId);

    if (currentBalance <= 0) {
      throw new Error("Insufficient credits");
    }

    const newBalance = currentBalance - 1;

    await CreditTransaction.create([{
      userId,
      type: "DEDUCT",
      reason,
      amount: 1,
      balanceAfter: newBalance,
    }], { session });

    // ✅ 🔥 ADD THIS BLOCK HERE
    const { sendPushNotification } = require("../../utils/pushNotification");

    const sub = await Subscription.findOne({ userId });

    if (
      newBalance === 1 &&
      sub &&
      sub.status === "ACTIVE" &&
      (sub.planType === "MONTHLY" || sub.planType === "YEARLY")
    ) {
      await sendPushNotification(userId, {
        title: "Low Credits",
        body: "Your credits are low. Please top-up to continue using the app."
      });
    }

    // ✅ commit AFTER push check
    await session.commitTransaction();
    session.endSession();

    return newBalance;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

/**
 * Reset all remaining credits (used on renewal)
 */
async function resetCredits(userId) {

  const currentBalance = await getUserBalance(userId);

  if (currentBalance <= 0) return 0;

  const newBalance = 0;

  await CreditTransaction.create({
    userId,
    type: "DEDUCT", // ✅ must be valid enum
    reason: "ADMIN_ADJUSTMENT", // or "RENEWAL"
    amount: currentBalance,
    balanceAfter: newBalance,
  });


  return newBalance;
}
  

module.exports = {
  getUserBalance,
  addCredits,
  deductCredit, 
  resetCredits,
};
