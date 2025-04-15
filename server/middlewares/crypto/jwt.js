const jwt = require("jsonwebtoken");

module.exports = {
  jwtSign: (payload) => {
    let expiredIn = 60 * 60 * 1;
    // return jwt.sign({ payload }, process.env.JWT_SECRET, {expiredIn});
    return jwt.sign({ payload }, process.env.JWT_SECRET);
  },
  cekJwt: (token) => {
    try {
      // Hasil: { payload, iat }
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Jika token salah
      return { status: false, msg: "Token Salah!" };
    }
  },
};
