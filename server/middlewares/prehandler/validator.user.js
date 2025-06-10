const schemaValidatorUser = (schema) => {
  return async (req, reply) => {
    try {
      req.body = schema.parse(req.body); // overwrite req.body agar sudah divalidasi
    } catch (err) {
      const errorMsg = err.errors.map((e) => e.message);
      console.log(errorMsg, err);
      return reply.code(400).send({
        status: false,
        message: "Validasi gagal",
        error: errorMsg,
      });
    }
  };
};

module.exports = { schemaValidatorUser };
