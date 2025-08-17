// const schemaValidatorUser = (schema) => {
//   return async (req, reply) => {
//     console.log(req.body);
//     try {
//       req.body = await schema.parse(req.body); // overwrite req.body agar sudah divalidasi
//     } catch (err) {
//       const errorMsg = err.errors.map((e) => e.message);
//       console.log(errorMsg, err);
//       return reply.code(400).send({
//         status: false,
//         message: "Validasi gagal",
//         error: errorMsg,
//       });
//     }
//   };
// };

// module.exports = { schemaValidatorUser };

// middlewares/schemaValidatorUser.js
const schemaValidatorUser = (schema) => {
  return async function (req, reply) {
    try {
      req.body = await schema.parseAsync(req.body); // pakai async biar aman kalau ada refine
    } catch (err) {
      const errorMsg = err.errors?.map((e) => e.message) ?? ["Unknown error"];
      console.error("Validation Error:", errorMsg, err);
      return reply.code(400).send({
        status: false,
        message: "Validasi gagal",
        data: errorMsg,
      });
    }
  };
};

module.exports = { schemaValidatorUser };
