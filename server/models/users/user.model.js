const root_path = process.env.ROOT_PATH;
const { roleUser } = require(process.env.CONFIG_FILE);

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { capitalizeCase } = require(`${root_path}/services`);

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: roleUser,
      default: "Admin",
      trim: true,
    },
    password: {
      type: String,
      require: true,
      // Selection: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

//Encrypt password , salt (kedalaman) = 5
const encryptPassword = async (password, jumSalt = 5) => {
  const salt = await bcryptjs.genSalt(jumSalt);
  return await bcryptjs.hash(password, salt);
};

// Prepare sebelum save ke database
UserSchema.pre("save", async function (next) {
  try {
    // Jika role bukan ["Admin", "User", "Team"];
    if (this.isModified("role") && !roleUser.includes(this.role)) {
      console.log(
        "Ada yang mencoba mengubah alur role yang telah ditetapkan!!!"
      );
      delete this.role; // Hapus role yang tidak valid
    }

    if (this.isModified("role") || this.isNew) {
      this.role = capitalizeCase(this.role);
    }

    // Enkripsi password jika diubah atau baru
    if (this.isModified("password") || this.isNew) {
      this.password = await encryptPassword(this.password);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Prepare sebelum mengganti data ke database
UserSchema.pre(
  ["updateOne", "findByIdAndUpdate", "findOneAndUpdate"],
  async function (next) {
    const data = this.getUpdate();
    if (data.password) {
      data.password = await encryptPassword(data.password);
    }

    // Jika role tidak sama yang telah ditentukan
    if (data.role && !roleUser.includes(data.role)) {
      delete data.role;
    }

    if (data.role) {
      this.role = capitalizeCase(data.role);
    }

    next();
  }
);

// Menyamakan password pada database
UserSchema.methods.comparePassword = async function (password) {
  try {
    const hasil = await bcryptjs.compare(password, this.password);
    return hasil;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const User = mongoose.model("user", UserSchema);

module.exports = { User };
