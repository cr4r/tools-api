const root_path = process.env.ROOT_PATH;
const { User, HistoryLogin } = require(`${root_path}/models`);
const {
  hashToken,
  verifyToken,
  generateAccessToken,
  handleServerResponseError,
} = require(`${root_path}/services`);

//// UNTUK REFRESH TOKEN, AKSES TOKEN BARU
const user_token_refresh = async (req, reply) => {
  const token = req.cookies?.refresh_token || req.query?.token;
  console.log("Saat melakukan refresh token (Cookie) ====>", token);
  if (!token) {
    return reply
      .code(401)
      .send({ status: false, message: "Refresh token tidak ditemukan" });
  }

  try {
    const saved = await HistoryLogin.findOne({ token: hashToken(token) });
    if (!saved)
      return reply
        .code(403)
        .send({ error: "Token tidak valid atau sudah dicabut" });

    const { status, message, codeStatus } = verifyToken(token, "refresh");
    if (!status) return reply.status(codeStatus).send({ status, message });

    const user = await User.findById(message.id);
    if (!user) {
      await HistoryLogin.deleteMany({ userId: message.id });
      return reply
        .status(401)
        .send({ status: false, message: "User tidak ada atau sudah terhapus" });
    }

    const newAccessToken = generateAccessToken(user, saved.jti);

    return reply.status(201).send({
      status: true,
      message: "Berhasil memperbarui token kamu",
      token: newAccessToken,
    });
  } catch (err) {
    console.error(err);
    return reply.code(403).send({
      status: false,
      message: "Refresh Token tidak valid atau kadaluarsa",
    });
  }
};

const user_history_delete = async (req, reply) => {
  const userId = req.params.id;
  try {
    const historyDelete = await HistoryLogin.findByIdAndDelete(userId);
    if (!historyDelete) {
      return reply
        .status(404)
        .send({ status: false, message: "User tidak ditemukan" });
    }
    return reply.status(200).send({
      status: true,
      message: `User dengan ID ${historyDelete._id} telah dihapus`,
    });
  } catch (err) {
    const { codeStatus, status, message } = await handleServerResponseError(
      err
    );
    return reply.status(codeStatus).send({ status, message });
  }
};

module.exports = {
  user_token_refresh,
  user_history_delete,
};
