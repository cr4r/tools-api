const root_path = process.cwd();
const {
  generateAccessToken,
  generateRefreshToken,
  expiryDateToken,
  verifyToken,
  hashToken,
  optionCookie,
} = require(`${root_path}/services`);
const { User, HistoryLogin } = require(`${root_path}/models/users`);

const login_post = async (req, reply) => {
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
  if (!isMatch)
    return reply.code(401).send({ status: false, message: "Password salah" });

  //// Hapus semua token user jika device sama saat login
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ip = req.ip || req.socket.remoteAddress || "Unknown";
  // Hapus token refresh lama dari device yang sama
  await HistoryLogin.deleteMany({
    userId: user._id,
    "deviceInfo.rawUA": userAgent,
  });

  //// Membuat akses dan refresh token yang baru
  const refreshToken = await generateRefreshToken(user);

  //// tambahkan JTI (penanda refresh token)
  const accessToken = await generateAccessToken(user, refreshToken.jti);

  //// Simpan Refresh Token User ke database di HistoryLogin
  await HistoryLogin.create({
    userId: user._id,
    //// Token di encrypt untuk mencegah jika db bocor
    token: hashToken(refreshToken.token),
    //// JTI DIGUNAKAN UNTUK MENGHAPUS TOKEN PER USER / JTI
    jti: refreshToken.jti,
    deviceInfo: req.deviceInfo,
    expiryDate: expiryDateToken("refresh"),
  });

  console.log("optionCookie", optionCookie());
  return reply
    .setCookie("refresh_token", refreshToken.token, optionCookie())
    .header("Authorization", `Bearer ${accessToken}`)
    .send({
      status: true,
      message: "Login berhasil!",
      accessToken, // ini yang akan dipakai oleh aplikasi Android
      // refreshToken: refreshToken.token,
    });
};

const logout_post = async (req, reply) => {
  // const { token } = req.body;
  const token = req.cookies?.refresh_token;

  console.log(req.cookies);
  if (!token)
    return reply.status(400).send({
      status: false,
      message: "Refresh token diperlukan untuk logout",
    });

  // Verifikasi refresh token
  const { status, message, codeStatus } = verifyToken(token, "refresh");
  if (status == false)
    return reply.status(codeStatus).send({ status, message });

  // Ambil jti dari token
  const tokenJti = message.jti;

  if (!tokenJti) {
    return reply.status(400).send({
      status: false,
      message: "Token tidak valid (tidak ada jti)",
    });
  }

  // Hapus token dari database
  const deleted = await HistoryLogin.findOneAndDelete({ jti: tokenJti });

  if (!deleted) {
    return reply.status(404).send({
      status: false,
      message: "Token tidak ditemukan atau sudah dihapus",
    });
  }

  return reply.clearCookie("refresh_token", { path: "/" }).status(200).send({
    status: true,
    message: "Logout berhasil, token lama telah dihapus",
  });
};

module.exports = {
  login_post,
  logout_post,
};
