const registrasi_post = async (req, reply) => {
  return reply.status(200).send("oke post");
};

const registrasi_put = async (req, reply) => {
  return reply.status(200).send("oke update");
};

const registrasi_delete = async (req, reply) => {
  return reply.status(200).send("oke delete");
};

module.exports = {
  registrasi_post,
  registrasi_put,
  registrasi_delete,
};
