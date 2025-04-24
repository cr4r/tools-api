const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

const refreshTokenModel = mongoose.model("HistoryLogin", RefreshTokenSchema);

module.exports = refreshTokenModel;
