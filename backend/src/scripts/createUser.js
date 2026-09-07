import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createUser = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);

    console.log("Connected to MongoDB");

    // user
    const username = "hoang";
    const password = "hoanghoang";

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      console.log("User already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user1 = await User.create({
      username,
      hashedPassword,
      role: "user",
    });

    console.log("User created successfully");
    console.log("Username:", user1.username);
    console.log("Role:", user1.role);

  } catch (error) {
    console.error("Failed to create user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createUser();