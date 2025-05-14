// file: validations/userValidation.js
const { z } = require("zod");

const baseUserSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name minimal 3 karakter" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Nama lengkap hanya boleh huruf dan spasi",
    }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(3, { message: "Password minimal 3 karakter" }),
  role: z.enum(["Admin", "User"]).optional(),
});

// 👇 Registrasi: semua wajib
const userRegisterSchema = baseUserSchema;

// 👇 Update: semua opsional
const userUpdateSchema = baseUserSchema.partial();

module.exports = {
  userRegisterSchema,
  userUpdateSchema,
};
