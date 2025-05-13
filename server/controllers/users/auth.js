const root_path = process.env.ROOT_PATH;
const { User, HistoryLogin } = require(`${root_path}/models`);
const {
  hashToken,
  verifyToken,
  generateAccessToken,
} = require(`${root_path}/services`);

//// UNTUK REFRESH TOKEN, AKSES TOKEN BARU
const user_token_post = async (req, reply) => {
  //// Token = Refresh Token
  const { token } = req.body;
  if (!token)
    return reply
      .code(401)
      .send({ status: false, message: "Token refresh diperlukan" });

  const saved = await HistoryLogin.findOne({ token: hashToken(token) });
  if (!saved)
    return reply
      .code(403)
      .send({ error: "Token tidak valid atau sudah dicabut" });

  try {
    ////GUNAKAN REFRESH TOKEN UNTUK TOKENNYA
    const { status, message, codeStatus } = verifyToken(token, "refresh");
    if (status == false)
      return reply.status(codeStatus).send({ status, message });

    //// AMBIL DATA USER SESUAIKAN DENGAN ID YANG ADA DI REFRESH TOKEN
    const user = await User.findById(message.id);
    if (!user) {
      //// GUNAKAN LOGIC DISINI UNTUK HAPUS APA SAJA JIKA USER TIDAK ADA
      // Hapus seluruh token refresh milik user ini
      await HistoryLogin.deleteMany({ userId: payload.id });

      return reply
        .status(401)
        .send({ status: false, message: "User tidak ada atau sudah terhapus" });
    }

    //// JIKA VALID, MAKA BUAT ACCESS TOKEN BARU
    const newAccessToken = generateAccessToken(user);

    return reply.status(201).send({
      status: true,
      message: "Berhasil memperbarui token kamu",
      token: newAccessToken,
    });
  } catch (err) {
    console.log(err);
    return reply.code(403).send({
      status: false,
      message: "Refresh Token tidak valid atau kadaluarsa",
    });
  }
};

module.exports = {
  user_token_post,
};
