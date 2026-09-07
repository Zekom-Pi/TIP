// @ts-nocheck
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// xác minh user là ai
export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token not found",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//kiểm tra token bằng mã bí mật, nếu sai / hết hạn => catch
    const user = await User.findById(decodedUser.userId).select("-hashedPassword"); // loại bỏ trường mật khẩu để bảo mật

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    req.user = user; //gán user vào req

    next(); //req đi tiếp
  } catch (error) {
    console.error("JWT error at Middleware:", error);

    return res.status(403).json({
      message: "Access token expired or invalid",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });//chưa đăng nhập
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin permission required",
    });//không phải admin
  }

  next();
};