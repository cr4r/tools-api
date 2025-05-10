const usermodel = require("./user.model");
const refreshTokenmodels = require("./refreshToken.model");

module.exports = {
  ...usermodel,
  ...refreshTokenmodels,
};
