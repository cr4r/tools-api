const registrasi = require("./registrasi");
const login = require("./login");
const logout = require("./logout");
const auth = require("./auth");

module.exports = {
  ...registrasi,
  ...login,
  ...logout,
  ...auth,
};
