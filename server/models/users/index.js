const userModel = require("./user.model");
const userTokenModels = require("./user.token.model");
const userAuditModels = require("./user.audit.model");

module.exports = {
  ...userModel,
  ...userTokenModels,
  ...userAuditModels,
};
