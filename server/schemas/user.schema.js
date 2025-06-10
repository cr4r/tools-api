// file: validations/userValidation.js
const { z } = require("zod");
const root_path = process.cwd();
const { roleUser } = require(root_path + '/' + process.env.CONFIG_FILE);

const baseUserSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name minimal 3 karakter" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Nama lengkap hanya boleh huruf dan spasi",
    }),
  email: z
    .string()
    .email({ message: "Email tidak valid" })
    .refine(
      (val) => {
        const localPart = val.split("@")[0];
        return localPart.length >= 3;
      },
      {
        message: "user email biasanya minimal 3 karakter",
      }
    ),
  password: z.string().min(3, { message: "Password minimal 3 karakter" }),
  role: z.enum(roleUser).optional(),
});

// 👇 Registrasi: semua wajib
const userRegisterSchema = baseUserSchema;

// 👇 Update: semua opsional
const userUpdateSchema = baseUserSchema.partial();

module.exports = {
  userRegisterSchema,
  userUpdateSchema,
};
