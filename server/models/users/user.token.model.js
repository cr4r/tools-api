const mongoose = require("mongoose");

const HistoryLoginSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //// DARI REFRESH TOKEN
    token: { type: String, required: true },
    jti: { type: String, required: true, index: true },
    expiryDate: { type: Date, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      os: String,
      browser: String,
      ip: String,
      device: String,
      userAgent: String,
      device: String,
      sourceType: String,
      rawUA: String,
    },
    iss: String,
    aud: String,
  },
  { timestamps: true }
);

/* TTL index (hapus otomatis setelah expired)
User yang expired akan terhapus otomatis*/
HistoryLoginSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const HistoryLogin = mongoose.model("HistoryLogin", HistoryLoginSchema);

module.exports = { HistoryLogin };
