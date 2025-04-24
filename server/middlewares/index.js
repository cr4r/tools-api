const crypto_mid = require("./crypto");
const umum_mid = require("./umum");
const handleServer_mid = require("./handleServer");

module.exports = {
  ...crypto_mid,
  ...umum_mid,
  ...handleServer_mid,
};
