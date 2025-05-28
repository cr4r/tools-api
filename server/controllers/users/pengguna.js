const root_path = process.env.ROOT_PATH;
const {
  handleServerResponseError,
  sanitizeInput,
  verifyToken,
} = require(`${root_path}/services`);
const { User, UserAuditLog, HistoryLogin } = require(`${root_path}/models`);
const bcryptjs = require("bcryptjs");

const pengguna_put = async (req, reply) => {
  try {
    let allowInput = ["email", "password", "fullName"];
    let body = await sanitizeInput(req.body, allowInput);

    //// Mengupdate dari body ke req.user
    Object.assign(req.user, body);
    await req.user.save();
    //// Logic disini     req.user  => sudah ada
    return reply
      .status(201)
      .send({ status: true, body, message: "Data kamu berhasil di ubah" });
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
      .send({ status: false, message: "Admin tidak bisa hapus akun sendiri" });
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
  return reply.status(200).send({
    status: true,
    message: `User dengan ID ${deleted._id} telah dihapus`,
  });
};

//// Mengambil semua aktivitas user yang login
const pengguna_get = async (req, reply) => {
  console.log("gass");
  const cariIdUser = req.params.id;
  const userToken = req.user;

  if (userToken.role === "User" && userToken._id !== cariIdUser) {
    return reply.status(403).send({
      status: false,
      message: "Anda tidak mempunyai akses untuk melihat user lain",
    });
  }

  // Ambil login history dan gunakan lean() agar hasilnya plain JS object (lebih ringan)
  const historyLogin = await HistoryLogin.find({ userId: cariIdUser }).lean();

  // Proses hasil untuk ambil field yang dibutuhkan
  const hasilFilter = historyLogin.map((item) => ({
    akun: item.userId,
    deviceInfo: item.deviceInfo,
    expiredDate: item.expiryDate,
  }));

  reply.status(200).send({ status: true, message: "OK", data: hasilFilter });
};

module.exports = {
  pengguna_put,
  pengguna_delete,
  pengguna_get,
};
