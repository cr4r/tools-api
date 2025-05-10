const root_path = process.env.ROOT_PATH;
const {
  generateAccessToken,
  generateRefreshToken,
  expiryDateToken,
} = require(`${root_path}/middlewares`);

const { User, HistoryLogin } = require(`${root_path}/models/users`);

const { hashToken } = require(`${root_path}/services`);

const login_post = async (req, reply) => {
  console.log(req.deviceInfo);
  const { email, password } = req.body;

  // Cek apakah ada email di body
  const user = await User.findOne({ email });
  if (!user)
    return reply
      .code(401)
      .send({ status: false, message: "Email tidak ditemukan" });

  // Cek apakah ada password di body
  if (!password)
    return reply
      .code(401)
      .send({ status: false, message: "Password tidak ada" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return reply.code(401).send({ error: "Password salah" });

  const refreshToken = await generateRefreshToken(user);

  const accessToken = await generateAccessToken(user);

  // Simpan Refresh Token User ke database di HistoryLogin
  await HistoryLogin.create({
    userId: user._id,
    //// Token di encrypt untuk mencegah jika db bocor
    token: hashToken(refreshToken.token),
    //// JTI DIGUNAKAN UNTUK MENGHAPUS TOKEN PER USER / JTI
    jti: refreshToken.jti,
    deviceInfo: req.deviceInfo,
    expiryDate: expiryDateToken("refresh"),
  });

  reply
    .code(200)
    .header("x-auth-token", accessToken) // opsional, kalau client ingin ambil dari header
    .send({
      message: "Login berhasil",
      accessToken: accessToken, // ini yang akan dipakai oleh aplikasi Android
      refreshToken: refreshToken.token,
    });
};

const logout_post = async (req, reply) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  reply.send({ status: true, message: "Logout berhasil" });
};

module.exports = {
  login_post,
  logout_post,
};
