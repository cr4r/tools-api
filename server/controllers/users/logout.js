const root_path = process.env.ROOT_PATH;

const jwt = require("jsonwebtoken");
const { User, HistoryLogin } = require(`${root_path}/models`);

const logout_post = async (req, reply) => {
  const { token } = req.body;

  if (!token)
    return reply.status(400).send({
      status: false,
      message: "Refresh token diperlukan untuk logout",
    });

  try {
    // Verifikasi refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Ambil jti dari token
    const tokenJti = decoded.jti;

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

    return reply.status(200).send({
      status: true,
      message: "Logout berhasil, token telah dihapus",
    });
  } catch (err) {
    console.error(err);
    return reply.status(403).send({
      status: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

module.exports = { logout_post };
