const jwt = require("jsonwebtoken");
const ms = require("ms");
const { v4: uuidv4 } = require("uuid"); // untuk buat jti unik

const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const access_token_exp = process.env.ACCESS_TOKEN_EXPIRY;
const refresh_token_exp = process.env.REFRESH_TOKEN_EXPIRY;

/*Akses token (tanpa login) digunakan untuk mendapatkan informasi user tanpa perlu load ke database dan tidak disimpan di db
Refresh Token (setelah login) digunakan untuk mendapatkan akses token serta log disimpan dalam database*/

let issuer = "coders.family.api";
let audience = "coders.family.app";

function generateAccessToken(
  user,
  jti = uuidv4(),
  expiresIn = access_token_exp
) {
  const { _id, email, role, fullName, foto, createdAt } = user;
  return jwt.sign(
    {
      id: _id,
      email,
      role,
      fullName,
      jti,
      createdAt,
      iat: Math.floor(Date.now() / 1000),
    },
    access_token_exp,
    {
      expiresIn: expiresIn,
      issuer,
      audience,
    }
  );
}

function generateFotoToken(user, foto, jti = uuidv4()) {
  return jwt.sign(
    {
      id: user._id,
      foto,
      jti,
      iat: Math.floor(Date.now() / 1000),
    },
    refresh_token_secret,
    {
      expiresIn: access_token_exp,
      issuer,
      audience,
    }
  );
}

function generateRefreshToken(user) {
  const jti = uuidv4(); // ID unik token
  let token = jwt.sign(
    {
      id: user._id,
      jti,
    },
    refresh_token_secret,
    {
      expiresIn: refresh_token_exp,
      issuer,
      audience,
    }
  );
  return {
    token,
    jti,
  };
}

const verifyToken = (token, jenis) => {
  try {
    jenis =
      jenis.toLowerCase() == "access"
        ? access_token_secret
        : refresh_token_secret;
    let decoded = jwt.verify(token, jenis, {
      issuer,
      audience,
    });
    return { status: true, message: decoded };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      codeStatus: 403,
      message: "Token tidak valid atau kadaluarsa",
    };
  }
};

const expiryDateToken = (jenis) => {
  return jenis == "refresh"
    ? new Date(Date.now() + ms(refresh_token_exp))
    : new Date(Date.now() + ms(access_token_exp));
};

const getTokenReq = (req, cookieKey = null) => {
  const authHeader = req.headers["authorization"]?.trim();
  let headAuth = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const reqCookie = cookieKey && req.cookies?.[cookieKey];
  return (
    reqCookie ||
    req.headers["x-auth-token"] ||
    headAuth ||
    req.body?.token ||
    req.query?.token
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  expiryDateToken,
  verifyToken,
  getTokenReq,
  generateFotoToken,
};
