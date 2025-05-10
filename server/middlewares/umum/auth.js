const isAdmin = (req, reply, done) => {
  if (req.user.role !== "Admin") {
    return reply.code(403).send({ error: "Akses khusus admin" });
  }
  done();
};

const auth = (req, reply, done) => {
  const token = req.headers["x-auth-token"] || req.body.token;
  if (!token)
    return reply.code(401).send({
      status: true,
      message: "Error!!!",
      error: "Token tidak ditemukan",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan info user dari token
    done();
  } catch (err) {
    return reply
      .code(403)
      .send({ status: true, message: "error!!!", error: "Token tidak valid" });
  }
};

module.exports = {
  isAdmin,
  auth,
};
