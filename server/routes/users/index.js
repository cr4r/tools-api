const UserRegistrasi = require("./user.registrasi.routes.js");
const userLoginRoutes = require("./user.login.routes.js");
const userPenggunaRoutes = require("./user.pengguna.routes.js");
const usertokenRoutes = require("./user.token.routes.js");

module.exports = {
  ...UserRegistrasi,
  ...userLoginRoutes,
  ...usertokenRoutes,
  ...userPenggunaRoutes,
};
