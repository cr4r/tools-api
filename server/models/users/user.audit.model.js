const root_path = process.cwd();
const mongoose = require("mongoose");

const UserAuditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ["DELETE_USER"], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
});

const UserAuditLog = mongoose.model("UserAuditLog", UserAuditLogSchema);

module.exports = { UserAuditLog };
