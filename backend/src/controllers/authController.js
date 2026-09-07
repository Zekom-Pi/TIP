import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; 
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

/*export const signUp = async (req , res) => {
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({
                message: "username and password are needed",
            });
        }

        const duplicate = await User.findOne({username});

        if (duplicate) {
            return res.status(409).json({message: "Already have username"});

        }
        const hashedPassword = await bcrypt.hash(password,10);

        await User.create({
            username,
            hashedPassword,
        });

        return res.sendStatus(204);

    }   
    catch(error){
        console.error("Failed to call signUp" , error);
        return res.status(500).json({message : "System failed"});

    } 
};
*/

export const signIn = async (req , res) => {
    try {
        const {username , password} = req.body;
        if( !username || !password){
            return res.status(400).json({message : "username and password are needed"});

        }

        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message: "username or password is incorrect"});

        }

        const passwordCorrect = await bcrypt.compare(password , user.hashedPassword);
        if(!passwordCorrect){
            return res.status(401).json({message : "password is incorrect"});

        }
        if(user.role !== "admin"){
          return res.status(403).json({message : "Admin only"});
        }
         const accessToken = jwt.sign(
      { userId: user._id },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tạo session mới để lưu refresh token
    await Session.create({
      userId: user._id,
      
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.username} đã logged in!`, accessToken });

    } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xoá refresh token trong Session
      await Session.deleteOne({ refreshToken: token });

      // xoá cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// tạo access token mới từ refresh token
export const refreshToken = async (req, res) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    // so với refresh token trong db
    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // kiểm tra hết hạn chưa
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token expired." });
    }

    // tạo access token mới
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // return
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Failed to call refreshToken", error);
    return res.status(500).json({ message: "System error" });
  }
};