const schemaValidatorUser = (schema) => {
  return async (req, reply) => {
    try {
      req.body = schema.parse(req.body); // overwrite req.body agar sudah divalidasi
    } catch (err) {
      return reply.code(400).send({
        status: false,
        message: "Validasi gagal",
        error: err.errors.map((e) => e.message),
      });
    }
  };
};

module.exports = { schemaValidatorUser };
