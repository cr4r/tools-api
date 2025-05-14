/**
 * Menyaring hanya field yang diizinkan dari sebuah objek
 * @param {Object} data - Payload asli (biasanya dari req.body)
 * @param {string[]} allowedFields - Daftar field yang boleh disimpan
 * @returns {Object} Payload yang sudah difilter
 */
function sanitizeInput(data, allowedFields) {
  const sanitized = {};
  for (const key of allowedFields) {
    if (data.hasOwnProperty(key)) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

const validateInputUser = (data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{3,}$/;
  const fullNameRegex = /^[A-Za-z\s]{3,}$/;

  const errors = {};

  if (!emailRegex.test(data.email)) {
    errors.email = "Email tidak valid";
  }

  if (!passwordRegex.test(data.password)) {
    errors.password = "Password minimal 3 karakter";
  }

  if (!fullNameRegex.test(data.fullName)) {
    errors.fullName = "Full name minimal 3 huruf dan hanya huruf/spasi";
  }

  return errors;
};

module.exports = { sanitizeInput, validateInputUser };
