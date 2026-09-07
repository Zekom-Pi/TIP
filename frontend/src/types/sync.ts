// Trạng thái đồng bộ
export type SyncStatus =
  | "running"
  | "success"
  | "failed";

// Thông tin Source trong SyncLog
export interface SyncLogSource {
  _id: string;
  name: string;
  type: "API" | "RSS";
  url: string;
}

// User thực hiện Sync
export interface SyncLogUser {
  _id: string;
  username: string;
}

// Một bản ghi SyncLog
export interface SyncLog {
  _id: string;
  source: SyncLogSource | string;
  triggeredBy: SyncLogUser | string;
  status: SyncStatus;
  totalFetched: number;
  newIOC: number;
  duplicateIOC: number;
  errorCount: number;
  message: string;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Response GET /api/sync/logs
export interface SyncLogListResponse {
  logs: SyncLog[];
}