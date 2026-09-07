import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Tên đăng nhập
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Mật khẩu đã được hash bằng bcrypt
    hashedPassword: {
      type: String,
      required: true,
    },

    // Vai trò của người dùng : hiện tại chỉ hỗ trợ admin
    role: {
      type: String,
      enum: ["admin" , "user"],
      default : "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;