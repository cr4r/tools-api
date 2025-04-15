const registrasi = require("./registrasi");
const login = require("./login");

module.exports = {
  ...registrasi,
  ...login,
};
