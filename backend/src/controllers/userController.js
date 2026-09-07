export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Failed to call authMe", error);
    return res.status(500).json({ message: "System error" });
  }
};

//xác thực người dùng hiện tại là ai