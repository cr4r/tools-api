const root_path = process.env.ROOT_PATH;
const {
  generateAccessToken,
  generateRefreshToken,
} = require(`${root_path}/middlewares`);
const { User, refreshTokenModel } = require(`${root_path}/models`);

const login_post = async (req, reply) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return reply.code(401).send({ error: "Email tidak ditemukan" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return reply.code(401).send({ error: "Password salah" });

  const accessToken = generateAccessToken({
    _id: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({ _id: user._id });

  // Simpan refresh token ke database
  await HistoryLogin.create({
    userId: user._id,
    token: refreshToken,
    expiryDate: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  user.refresh_token = refreshToken;
  await user.save();

  reply
    .code(200)
    .header("x-auth-token", accessToken) // opsional, kalau client ingin ambil dari header
    .send({
      message: "Login berhasil",
      token: accessToken, // ini yang akan dipakai oleh aplikasi Android
      refreshToken,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
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
