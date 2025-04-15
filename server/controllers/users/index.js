const registrasi = require("./registrasi");
const login = require("./login");
const auth = require("./auth");

module.exports = {
  ...registrasi,
  ...login,
  ...auth,
};
