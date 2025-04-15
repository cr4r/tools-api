const root_path = process.env.ROOT_PATH;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { capitalizeCase } = require(`${root_path}/middlewares/`);

let typeUser = ["Admin", "User", "Team"];

const UserSchema = new mongoose.Schema({
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
    enum: typeUser,
    default: "Admin",
    trim: true,
  },
  password: {
    type: String,
    require: true,
    // Selection: false,
  },
  refresh_token: {
    type: String,
  },
});

//Encrypt password , salt (kedalaman) = 5
const encryptPassword = async (password, jumSalt = 5) => {
  const salt = await bcrypt.genSalt(jumSalt);
  return await bcrypt.hash(password, salt);
};

// Prepare sebelum save ke database
UserSchema.pre("save", async function (next) {
  try {
    // Jika role bukan ["Admin", "User", "Team"];
    if (this.isModified("role") && !typeUser.includes(this.role)) {
      console.log(
        "Ada yang mencoba mengubah alur role yang telah ditetapkan!!!"
      );
      delete this.role;
    }

    if (this.isModified("role") || this.isNew) {
      this.role = capitalizeCase(this.role);
    }

    // Encrypt Password User
    if (this.isModified("password") || this.isNew) {
      this.password = await encryptPassword(this.password);
    }
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
    if (data.role && !typeUser.includes(data.role)) {
      delete data.role;
    }
    if (data.role) {
      this.role = capitalizeCase(data.role);
    }
  }
);

// Menyamakan password pada database
UserSchema.methods.comparePassword = async function (password) {
  try {
    const hasil = await bcrypt.compare(password, this.password);
    return hasil;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
