const root_path = process.cwd();
const {
  generateAccessToken,
  generateRefreshToken,
  generateFotoToken,
  expiryDateToken,
  verifyToken,
  hashToken,
  optionCookie,
} = require(`${root_path}/services`);
const { User, HistoryLogin } = require(`${root_path}/models/users`);
const { OAuth2Client } = require("google-auth-library");
const clientIdGoogle =
  "483972912189-qsk2l1b0vp4h0jrrlqgvauaaquv4or71.apps.googleusercontent.com";
const googleClient = new OAuth2Client(clientIdGoogle);
const axios = require("axios");

async function urlToBuffer(imageUrl, token_google) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${token_google}`,
      },
    });
    const imageBuffer = Buffer.from(response.data, "binary");
    return Buffer.from(imageBuffer);
  } catch (e) {
    console.log(e);
    return;
  }
}

const login_post = async (req, reply) => {
  try {
    const { email, password, token_google } = req.body;
    let user_google, base64Image;

    if (token_google) {
      const ticket = await googleClient.verifyIdToken({
        idToken: token_google,
        audience: clientIdGoogle,
      });
      user_google = ticket.getPayload();
      const imageBuffer = await urlToBuffer(user_google.picture, token_google);
      base64Image = imageBuffer.toString("base64");
    } else {
      if (!password)
        return reply.code(401).send({
          status: false,
          message: "Masukkan password akun kamu dulu!",
        });
    }

    // console.log(user_google);

    const user = await User.findOne({
      email: email ? email : user_google.email,
    });
    // Cek apakah ada email di body
    if (!user) {
      let sendOption = { status: false, message: "Email tidak ditemukan" };
      if (token_google)
        sendOption.akun = { email: user_google.email, name: user_google.name };

      return reply.code(401).send(sendOption);
    }

    if (!token_google) {
      // Cek apakah ada password di body
      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return reply
          .code(401)
          .send({ status: false, message: "Password salah" });
    }

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
    const accessToken = await generateAccessToken(
      user,
      refreshToken.jti,
      token_google ? user_google.exp : process.env.ACCESS_TOKEN_EXPIRY
    );

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

    const generateFoto = await generateFotoToken(
      user,
      user.foto ? user.foto : base64Image,
      refreshToken.jti
    );

    // console.log("optionCookie", optionCookie());
    return reply
      .setCookie("refresh_token", refreshToken.token, optionCookie())
      .header("Authorization", `Bearer ${accessToken}`)
      .send({
        status: true,
        message: "Login berhasil!",
        accessToken, // ini yang akan dipakai oleh aplikasi Android
        foto: generateFoto,
      });
  } catch (e) {
    console.log(e);
    reply.status(500).send({ status: false, message: "Kesalahan pada server" });
  }
};

const logout_post = async (req, reply) => {
  const token = req.cookies?.refresh_token;

  // console.log(`Cookies: ${JSON.stringify(req.cookies)}`);
  if (!token)
    return reply.status(400).send({
      status: false,
      message: "Cookies diperlukan untuk logout",
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
