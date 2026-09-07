import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);

    console.log("Connected to MongoDB");

    // admin
    const username = "minh";
    const password = "minhminh";

    // Kiểm tra admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ username });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo admin
    const admin = await User.create({
      username,
      hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log("Username:", admin.username);
    console.log("Role:", admin.role);

  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();