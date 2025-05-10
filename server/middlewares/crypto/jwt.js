const jwt = require("jsonwebtoken");
const ms = require("ms");
const { v4: uuidv4 } = require("uuid"); // untuk buat jti unik

const root_path = process.env.ROOT_PATH;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const access_token_exp = process.env.ACCESS_TOKEN_EXPIRY;
const refresh_token_exp = process.env.REFRESH_TOKEN_EXPIRY;

const { User, HistoryLogin } = require(`${root_path}/models`);

/*Akses token (tanpa login) digunakan untuk mendapatkan informasi user tanpa perlu load ke database dan tidak disimpan di db
Refresh Token (setelah login) digunakan untuk mendapatkan akses token serta log disimpan dalam database*/

function generateAccessToken(user) {
  const { _id, email, role, fullName } = user;
  let payload = {
    id: _id.toString(),
    email,
    role,
    fullName,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, access_token_secret, {
    expiresIn: access_token_exp,
  });
}

function generateRefreshToken(user) {
  const jti = uuidv4(); // ID unik token

  let payload = {
    id: user._id.toString(),
    jti,
    iss: "coders.family.api", // nama issuer
    aud: "coders.family.app", // target audience (misalnya Android app)
  };

  return {
    token: jwt.sign(payload, refresh_token_secret, {
      expiresIn: refresh_token_exp,
    }),
    jti,
  };
}

const verifyTokenAndRole = async (req, reply) => {
  try {
    const token = req.headers["x-auth-token"];
    if (!token)
      return reply
        .code(401)
        .send({ status: false, message: "Token tidak ditemukan" });

    const decoded = jwt.verify(token, access_token_secret, {
      issuer: "coders.family.api",
      audience: "coders.family.app",
    });
    // Optional: validasi user masih aktif di database
    const user = await User.findById(decoded._id);
    if (!user)
      return reply
        .code(401)
        .send({ status: false, message: "User tidak ditemukan" });
    // Masukkan data user ke request untuk digunakan di controller berikutnya

    // Memeriksa role yang dibutuhkan (admin.user atau admin saja)
    const roles = req.requiredRole.split("."); // Memecah role, misalnya admin.user
    // Gabungkan pemeriksaan role admin dan user dalam satu kondisi
    if (
      (roles.includes("admin") && user.role !== "admin") ||
      (roles.includes("user") && user.role !== "user")
    ) {
      return reply.code(403).send({
        status: false,
        message:
          "Akses ditolak. Kamu tidak memiliki akses atau bukan data sendiri.",
      });
    }
    // Masukkan data user ke request untuk digunakan di controller berikutnya
    req.user = user;
  } catch (err) {
    console.error(err);
    return reply.code(403).send({
      status: false,
      error: err,
      message: "Token tidak valid atau kadaluarsa",
    });
  }
};

const expiryDateToken = (jenis) => {
  return jenis == "refresh"
    ? new Date(Date.now() + ms(refresh_token_exp))
    : new Date(Date.now() + ms(access_token_exp));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyTokenAndRole,
  expiryDateToken,
};
