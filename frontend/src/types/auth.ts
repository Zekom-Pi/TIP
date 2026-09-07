// Thông tin user được backend trả về
export interface User {
  _id: string;
  username: string;
  role: "admin" | "user";
  createdAt?: string;
  updatedAt?: string;
}

// Response khi đăng nhập
export interface SignInResponse {
  message: string;
  accessToken: string;
}

// Response khi gọi GET /api/users/me
export interface AuthMeResponse {
  user: User;
}