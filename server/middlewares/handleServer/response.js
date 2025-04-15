const { get } = require("mongoose");

/* await handleServerResponse(async () => {
    // Logic untuk membuat material
  }, reply);
*/
const handleServerResponse = async (tryBlock, reply) => {
  try {
    await tryBlock();
  } catch (err) {
    // Handling duplicate key error (MongoDB)
    if (err.code === 11000) {
      const duplicateKey = Object.keys(err.keyPattern)[0];
      const duplicateValue = err.keyValue[duplicateKey];
      return reply.status(400).send({
        status: false,
        message: `Data dengan ${duplicateKey} "${duplicateValue}" sudah ada. Silakan gunakan ${duplicateKey} yang berbeda.`,
      });
    }

    // Handling Validation Error (Mongoose)
    else if (err.name === "ValidationError") {
      const errors = err.errors;
      const errorMessages = Object.keys(errors).map((key) => {
        return `${key}`;
      });
      return reply.status(400).send({
        status: false,
        message: `Kesalahan bagian (${errorMessages
          .join(", ")
          .replace(/_/g, " ")}) harus di isi yang benar`,
      });
    }

    // Handling JWT Error
    else if (err.name === "JsonWebTokenError") {
      return reply.status(401).send({
        status: false,
        message: "Token tidak valid",
      });
    }

    // Handling Token Expired Error
    else if (err.name === "TokenExpiredError") {
      return reply.status(401).send({
        status: false,
        message: "Token sudah kadaluarsa",
      });
    }

    // Logging error untuk debug
    console.error(err);

    // Default error handling
    return reply.status(500).send({
      status: false,
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
};

const getReqParts = async (parts) => {
  const data = {};
  const files = [];
  try {
    for await (const part of parts) {
      if (part.file) {
        // Jika ini adalah file
        const fileData = {
          filename: part.filename,
          file: await part.toBuffer(), // Mengambil file sebagai buffer
        };
        files.push(fileData);
      } else {
        //// Jika ini adalah field biasa, jika ini array, convert string menjadi array
        try {
          data[part.fieldname] = JSON.parse(part.value || "[]");
        } catch {
          //// Jika ini bukan array maka masukkan langsung
          data[part.fieldname] = part.value;
        }
      }
    }
  } catch (e) {
    return { status: false, message: "Request tidak multipart" };
  }
  return { status: true, message: { data, files } };
};

module.exports = {
  getReqParts,
  handleServerResponse,
};
