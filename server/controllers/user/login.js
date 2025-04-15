const login_post = async (req, reply) => {
  return reply.status(200).send("oke post");
};

const login_put = async (req, reply) => {
  return reply.status(200).send("oke update");
};

const login_delete = async (req, reply) => {
  return reply.status(200).send("oke delete");
};

module.exports = {
  login_post,
  login_put,
  login_delete,
};
