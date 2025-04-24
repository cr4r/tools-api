const root_path = process.env.ROOT_PATH;
const { handleServerResponseError } = require(`${root_path}/middlewares`);
const { User } = require(`${root_path}/models`);

const registrasi_post = async (req, reply) => {
  // console.log(req.body);
  try {
    const create_user = new User(req.body);
    const result = await create_user.save();
    return reply
      .status(200)
      .send({ status: true, data: result, message: "ok berhasil terdaftar" });
  } catch (err) {
    const { codeStatus, status, message } = await handleServerResponseError(
      err
    );
    return reply.status(codeStatus).send({ status, message });
  }
};

const registrasi_put = async (req, reply) => {
  const { fullName, email, id } = req.body;

  // Akses user dari token
  const userFromToken = req.user;

  // Validasi: User hanya bisa edit dirinya sendiri kecuali dia Admin
  if (userFromToken.role !== "Admin" && userFromToken._id !== id) {
    return reply.code(403).send({
      status: false,
      message: "Error!!!",
      error: "Kamu tidak punya akses mengedit user ini",
    });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { fullName, email },
      { new: true }
    );

    if (!updated)
      return reply.code(404).send({
        status: false,
        message: "Error!!!",
        error: "User tidak ditemukan",
      });

    return reply.send({
      message: "Berhasil mengupdate user",
      user: {
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err) {
    return reply.code(500).send({
      status: false,
      message: "Error!!!",
      error: err.message,
    });
  }
};

const registrasi_delete = async (req, reply) => {
  return reply.status(200).send("oke delete");
};

module.exports = {
  registrasi_post,
  registrasi_put,
  registrasi_delete,
};
