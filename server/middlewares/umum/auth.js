const root_path = process.env.ROOT_PATH;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const access_token_exp = process.env.ACCESS_TOKEN_EXPIRY;
const refresh_token_exp = process.env.REFRESH_TOKEN_EXPIRY;

const jwt = require("jsonwebtoken");
const { User, HistoryLogin } = require(`${root_path}/models`);
const { verifyToken, getTokenReq } = require(`${root_path}/services`);

const isAdmin = async (req, reply, done) => {
  const accessTokenUser =
    req.headers["x-auth-token"] || req.body?.token || req.query?.token;

  if (!accessTokenUser)
    return reply.status(401).send({
      status: false,
      message: "Token tidak ditemukan di header, body, atau query",
    });

  const { status, message, codeStatus } = verifyToken(token, "refresh");
  if (status == false)
    return reply.status(codeStatus).send({ status, message });

  req.user = message;

  if (req.user.role !== "Admin")
    return reply.code(403).send({ error: "Akses khusus admin" });
};

const auth = async (req, reply, done) => {
  const accessTokenUser =
    req.headers["x-auth-token"] || req.body?.token || req.query?.token;

  if (!accessTokenUser)
    return reply.status(401).send({
      status: false,
      message: "Token tidak ditemukan di header, body, atau query",
    });

  const { status, message, codeStatus } = verifyToken(token, "refresh");
  if (status == false)
    return reply.status(codeStatus).send({ status, message });

  req.user = message; // Simpan info user dari token
};

function verifyTokenAndRole(allowedRolesStr, typeToken = "access") {
  return async function (req, reply) {
    // Ambil token dari berbagai sumber (header, body, query)
    const token = getTokenReq(req);
    if (!token) {
      return reply.status(401).send({
        status: false,
        message: "Token tidak ditemukan di header, body, atau query",
      });
    }

    const { status, message, codeStatus } = verifyToken(token, typeToken);
    if (status == false)
      return reply.status(codeStatus).send({ status, message });

    // =====================================================================
    // Optional: validasi user masih aktif di database
    const user = await User.findById(message.id);
    if (!user)
      return reply
        .code(401)
        .send({ status: false, message: "User tidak ditemukan" });
    // Masukkan data user ke request untuk digunakan di controller berikutnya

    // Memeriksa role yang dibutuhkan (admin.user atau admin saja)
    // Proses role // Memecah role, misalnya admin.user
    const allowedRoles = allowedRolesStr.split(".").map((r) => r.toLowerCase());
    const userRole = user.role?.toLowerCase();

    // Periksa hak akses
    const isAdmin = userRole === "admin";
    const isUser = userRole === "user";
    const allowAdmin = allowedRoles.includes("admin");
    const allowUser = allowedRoles.includes("user");

    // Validasi role
    if (
      (isAdmin && !allowAdmin) ||
      (isUser && allowUser && user?._id && message.id !== user._id.toString())
    ) {
      return reply.code(403).send({
        status: false,
        message: "Akses ditolak. Kamu tidak memiliki akses ke data ini.",
      });
    }
    // Masukkan data user ke request untuk digunakan di controller berikutnya
    req.user = user;
  };
}

module.exports = {
  isAdmin,
  auth,
  verifyTokenAndRole,
};
