const root_path = process.env.ROOT_PATH;
const {
  handleServerResponseError,
  sanitizeInput,
  verifyToken,
} = require(`${root_path}/services`);
const { User, UserAuditLog } = require(`${root_path}/models`);
const bcryptjs = require("bcryptjs");

const pengguna_put = async (req, reply) => {
  try {
    let allowInput = ["email", "password", "fullName"];
    let body = await sanitizeInput(req.body, allowInput);

    //// Logic disini     req.user  => sudah ada
    return reply
      .status(201)
      .send({ status: true, body, message: "Berhasil auth" });
  } catch (err) {
    const { codeStatus, status, message } = await handleServerResponseError(
      err
    );
    return reply.status(codeStatus).send({ status, message });
  }
};

const pengguna_delete = async (req, reply) => {
  const userId = req.params.id;
  if (!userId.match(/^[0-9a-fA-F]{24}$/))
    return reply.status(400).send({ status: false, message: "ID tidak valid" });

  // Cegah admin menghapus diri sendiri
  if (req.user.id === userId && req.user.role == "Admin") {
    return reply
      .status(403)
      .send({ status: false, message: "Tidak bisa hapus akun sendiri" });
  }

  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) {
    return reply
      .status(404)
      .send({ status: false, message: "User tidak ditemukan" });
  }

  // Simpan log penghapusan
  await UserAuditLog.create({
    action: "DELETE_USER",
    performedBy: req.user.id,
    targetUser: userId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  return reply.status(200).send({ status: true, message: "Belum tersedia" });
};

module.exports = {
  pengguna_put,
  pengguna_delete,
};
