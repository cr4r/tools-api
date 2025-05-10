const usermodel = require("./user.model");
const usertokenmodels = require("./user.token.model");

module.exports = {
  ...usermodel,
  ...usertokenmodels,
};
