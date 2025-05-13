const registrasi = require("./registrasi");
const login = require("./login");
const auth = require("./auth");
const pengguna = require("./pengguna");

module.exports = {
  ...registrasi,
  ...login,
  ...auth,
  ...pengguna,
};
