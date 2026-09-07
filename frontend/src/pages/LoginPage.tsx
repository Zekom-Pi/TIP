import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Nếu đã đăng nhập => chuyển tới Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Vui lòng nhập username và password.");
      return;
    }

    try {
      await signIn(username, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(
        error?.response?.data?.message ||
          "Username hoặc password không chính xác."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center px-6 text-white">
      <div className="relative w-full max-w-5xl min-h-[560px] border-2 border-white rounded-xl bg-[#12151b] overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <div className="grid min-h-[560px] grid-cols-2">
          <div className="relative flex flex-col justify-center px-16">
            {/* Title login */}
            <div>
              <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-white">
                Admin
                <br />
                Login
              </h1>
            </div>

            {/* button */}
            <button
              type="button"
              onClick={() => navigate("/user-login")}
              className="absolute bottom-8 left-8 rounded-xl border-2 border-white bg-[#12151b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              User Login
            </button>
          </div>

          <div className="relative flex items-center px-16">
            <div className="absolute left-0 top-10 bottom-10 border-l-2 border-dashed border-white/40" />

            <div className="w-full max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center gap-6">
                  <label
                    htmlFor="username"
                    className="w-24 shrink-0 text-base font-medium text-white"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="h-12 flex-1 rounded-full border-2 border-white bg-[#1a1d24] px-6 text-sm text-white outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label
                    htmlFor="password"
                    className="w-24 shrink-0 text-base font-medium text-white"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="h-12 flex-1 rounded-full border-2 border-white bg-[#1a1d24] px-6 text-sm text-white outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  />
                </div>

                {/* error */}
                {error && (
                  <div className="rounded-lg border-2 border-red-500 bg-red-950/50 px-4 py-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* login */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl border-2 border-white bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}