const text_ser = require("./text");
const response = require("./response");
const sanitizeInput = require("./sanitizeInput");
const jwt = require("./jwt");
const crypt = require("./crypt");
const configRoute = require("./configRoute");
module.exports = {
  ...text_ser,
  ...response,
  ...sanitizeInput,
  ...crypt,
  ...jwt,
  ...configRoute,
};
