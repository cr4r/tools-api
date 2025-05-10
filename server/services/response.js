const handleServerResponseError = async (err) => {
  // Handling duplicate key error (MongoDB)
  if (err.code === 11000) {
    const duplicateKey = Object.keys(err.keyPattern)[0];
    const duplicateValue = err.keyValue[duplicateKey];
    return {
      codeStatus: 400,
      status: false,
      message: `Data dengan ${duplicateKey} "${duplicateValue}" sudah ada. Silakan gunakan ${duplicateKey} yang berbeda.`,
    };
  }

  // Handling Validation Error (Mongoose)
  else if (err.name === "ValidationError") {
    const errors = err.errors;
    const errorMessages = Object.keys(errors).map((key) => {
      return `${key}`;
    });
    return {
      codeStatus: 400,
      status: false,
      message: `Kesalahan bagian (${errorMessages
        .join(", ")
        .replace(/_/g, " ")}) harus di isi yang benar`,
    };
  }

  // Handling JWT Error
  else if (err.name === "JsonWebTokenError") {
    return {
      codeStatus: 401,
      status: false,
      message: "Token tidak valid",
    };
  }

  // Handling Token Expired Error
  else if (err.name === "TokenExpiredError") {
    return {
      codeStatus: 401,
      status: false,
      message: "Token sudah kadaluarsa",
    };
  }

  // Logging error untuk debug
  console.error(err);

  // Default error handling
  return {
    codeStatus: 500,
    status: false,
    message: err.message || "Terjadi kesalahan pada server",
  };
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
  handleServerResponseError,
};
