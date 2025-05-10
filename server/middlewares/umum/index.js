const auth = require("./auth");
const DetectDevice = require("./DetectDevice");

module.exports = {
  ...auth,
  ...DetectDevice,
};
