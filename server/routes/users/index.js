const UserRegistrasi = require("./user.registrasi.routes.js");
const userLoginRoutes = require("./user.login.routes.js");
const userRefreshTokenRoutes = require("./user.refreshToken.routes.js");

module.exports = {
  ...UserRegistrasi,
  ...userLoginRoutes,
  ...userRefreshTokenRoutes,
};
