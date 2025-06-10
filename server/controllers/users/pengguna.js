const root_path = process.env.ROOT_PATH;
const {
  handleServerResponseError,
  sanitizeInput,
  generateAccessToken,
} = require(`${root_path}/services`);
const { User, UserAuditLog, HistoryLogin } = require(`${root_path}/models`);

const pengguna_get = async (req, reply) => {
  try {
    const page = parseInt(req.query.page) || 1; // Halaman ke berapa (default 1)
    const limit = parseInt(req.query.limit) || 10; // Jumlah data per halaman (default 10)
    const skip = (page - 1) * limit;

    // Total semua user (tanpa password)
    const total = await User.countDocuments();

    // Ambil data dengan pagination, exclude password
    const users = await User.find({}, "_id fullName email role createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Urut dari terbaru

    reply.send({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      data: users,
    });
  } catch (err) {
    console.error("Gagal mengambil data pengguna:", err);
    reply.status(500).send({
      status: false,
      message: "Terjadi kesalahan saat mengambil data pengguna",
    });
  }
};

const pengguna_put = async (req, reply) => {
  try {
    let updatedUser;
    const userIdQuery = req.query.userId;
    const currentUser = req.user;
    const isAdminEditingOtherUser =
      userIdQuery && ["Admin", "Owner", "Developer"].includes(currentUser.role);
    const allowedFields = isAdminEditingOtherUser
      ? ["email", "password", "fullName", "role"]
      : ["email", "password", "fullName"];
    const updates = await sanitizeInput(req.body, allowedFields);

    if (isAdminEditingOtherUser) {
      console.log("💼 Mode Admin: Editing user lain", updates);

      // Batasi pengubahan role
      const isAdmin =
        currentUser.role == "Admin" && ["Admin", "User"].includes(updates.role);
      const isDeveloper =
        currentUser.role == "Developer" &&
        ["Developer", "Admin", "User"].includes(updates.role);

      if (isAdmin) {
        return reply.code(403).send({
          status: false,
          message: `Admin tidak punya akses untuk mengubah role ke ${updates.role}`,
        });
      } else if (isDeveloper) {
        return reply.code(403).send({
          status: false,
          message: `Developer tidak punya akses untuk mengubah role ke ${updates.role}`,
        });
      }

      // Proses edit data
      if (Object.keys(updates).length > 0) {
        updatedUser = await User.findByIdAndUpdate(userIdQuery, updates, {
          new: true,
          runValidators: true,
        });
      } else {
        updatedUser = await User.findById(userIdQuery); // Ga ada update, ambil aja datanya
      }
    } else {
      console.log("👤 Mode User Biasa: Edit diri sendiri");

      // Apply changes hanya kalau ada yang beda
      let hasChanges = false;
      for (const key of Object.keys(updates)) {
        if (currentUser[key] !== updates[key]) {
          currentUser[key] = updates[key];
          hasChanges = true;
        }
      }

      updatedUser = hasChanges ? await currentUser.save() : currentUser;
    }

    if (!updatedUser) {
      return reply.code(404).send({
        status: false,
        message: "User tidak ditemukan",
      });
    }

    const token = await generateAccessToken(updatedUser);

    return reply.code(200).send({
      status: true,
      token,
      message: "Data berhasil diperbarui",
    });
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
  // if (req.user.id === userId && req.user.role == "Admin") {
  //   return reply
  //     .status(403)
  //     .send({ status: false, message: "Admin tidak bisa hapus akun sendiri" });
  // }

  try {
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
  } catch (err) {
    const { codeStatus, status, message } = await handleServerResponseError(
      err
    );
    return reply.status(codeStatus).send({ status, message });
  }
};

//// Mengambil semua aktivitas user yang login
const history_get = async (req, reply) => {
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
    id: item._id,
    akun: item.userId,
    deviceInfo: item.deviceInfo,
    expiredDate: item.expiryDate,
    jti: item.jti,
  }));

  reply.status(200).send({ status: true, message: "OK", data: hasilFilter });
};

module.exports = {
  pengguna_put,
  pengguna_delete,
  history_get,
  pengguna_get,
};
