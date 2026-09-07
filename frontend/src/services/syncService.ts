import api from "@/services/api";

import type {
  SyncLog,
  SyncLogListResponse,
} from "@/types/sync";

//Kết quả của một Source sau khi đồng bộ
 
export interface SyncSourceResult {
  success: boolean;
  source: string;
  totalFetched: number;
  newIOC: number;
  duplicateIOC: number;
  errorCount: number;
  message: string;
}


// Kết quả quá trình Sync
 
export interface SyncResult {
  success: boolean;
  totalSources: number;
  results: SyncSourceResult[];
}


 // POST /api/sync
 
export interface SyncResponse {
  message: string;
  result: SyncResult;
}


 // POST /api/sync
 
export const syncSources = async (): Promise<SyncResult> => {
  const response =
    await api.post<SyncResponse>("/sync");
  return response.data.result;
};

 // GET /api/sync/logs
 
export const getSyncLogs = async (): Promise<SyncLog[]> => {
  const response =
    await api.get<SyncLogListResponse>(
      "/sync/logs"
    );

  return response.data.logs;
};


//Lấy log đồng bộ mới nhất
 
export const getLatestSyncLog =
  async (): Promise<SyncLog | null> => {
    const logs = await getSyncLogs();
    if (logs.length === 0) {
      return null;
    }
    return logs[0];
  };