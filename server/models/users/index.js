const UserModel = require("./user.model");
const refreshTokenModels = require("./refreshToken.model");

module.exports = {
  ...UserModel,
  ...refreshTokenModels,
};
