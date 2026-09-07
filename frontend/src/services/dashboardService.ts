import api from "@/services/api";

import type {
  DashboardResponse,
} from "@/types/dashboard";

export const getDashboardStats =
  async (): Promise<DashboardResponse> => {
    const response =
      await api.get<DashboardResponse>(
        "/dashboard"
      );

    return response.data;
  };