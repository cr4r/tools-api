const crypto = require("crypto");

// Konfigurasi algoritma dan kunci enkripsi
const algorithm = "aes-256-cbc";
// Ambil kunci rahasia dari environment variable. Pastikan panjang minimal 32 byte.
// Misalnya: ENCRYPTION_SECRET="your-32-byte-long-secret-key-----"
const secretKey = process.env.ENCRYPTION_SECRET;

// Menghasilkan key 32 byte dari secretKey menggunakan scrypt
const key = crypto.scryptSync(secretKey, "salt", 32);

/**
 * Mengenkripsi data JSON.
 * @param {Object} data - Data objek yang akan dienkripsi.
 * @returns {string} - String terenkripsi dengan format: IV:encryptedData (dalam hex)
 */
function encryptData(data) {
  // Mengubah data JSON menjadi string
  const jsonString = JSON.stringify(data);

  // Buat IV (Initialization Vector) secara acak: IV memiliki panjang 16 byte
  const iv = crypto.randomBytes(16);

  // Membuat cipher instance dengan algoritma, key, dan iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Proses enkripsi
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Gabungkan IV (dalam hex) dan hasil enkripsi dengan delimiter (misalnya ":")
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Mendekripsi string yang telah dienkripsi.
 * @param {string} encryptedData - String terenkripsi dalam format IV:encryptedData.
 * @returns {Object} - Data objek asli hasil dekripsi.
 */
function decryptData(encryptedData) {
  // Pisahkan IV dan enkripsi data
  const [ivHex, encryptedText] = encryptedData.split(":");

  // Konversi IV kembali ke buffer
  const iv = Buffer.from(ivHex, "hex");

  // Membuat decipher instance
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  // Proses dekripsi
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  // Mengubah kembali string ke objek JSON
  return JSON.parse(decrypted);
}

////// Contoh penggunaan
// const dataUser = {
//   email: "user@example.com",
//   nama: "Ahmad Fatchurrachman",
//   role: "Admin",
//   password: "passwordRahasia123"
// };

// const encrypted = encryptData(dataUser);
// console.log("Data terenkripsi:", encrypted);

// const decrypted = decryptData(encrypted);
// console.log("Data terdekripsi:", decrypted);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  encryptData,
  decryptData,
  hashToken,
};
