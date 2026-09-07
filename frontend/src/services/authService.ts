import api from "@/services/api";

export const authService = {
  signIn: async (
    username: string,
    password: string
  ) => {
    const response = await api.post(
      "/auth/signin",
      {
        username,
        password,
      }
    );

    return response.data;
  },

  fetchMe: async () => {
    const response = await api.get(
      "/users/me"
    );

    return response.data;
  },

  signOut: async () => {
    await api.post("/auth/signout");
  },
};