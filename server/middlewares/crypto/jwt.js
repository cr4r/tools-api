const jwt = require("jsonwebtoken");

ACCESS_TOKEN_EXPIRY = "30m";
REFRESH_TOKEN_EXPIRY = "7d";

// Hitung dalam milidetik untuk disimpan di DB
const EXPIRY_MS = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
};

const parseExpiryToMs = (value) => {
  const match = /^(\d+)([dhm])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 hari
  const [, time, unit] = match;
  return parseInt(time) * EXPIRY_MS[unit];
};

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseExpiryToMs,
};
