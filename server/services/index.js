const text_ser = require("./text");
const response = require("./response");
const sanitizeInput = require("./sanitizeInput");
const crypt = require("./crypt");

module.exports = {
  ...text_ser,
  ...response,
  ...sanitizeInput,
  ...crypt,
};
