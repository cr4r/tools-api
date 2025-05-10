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

module.exports = { sanitizeInput };
