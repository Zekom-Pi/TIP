export interface IOCTypeStat {
  _id: "IP" | "DOMAIN" | "URL" | "HASH";
  count: number;
}

export interface DashboardSources {
  total: number;
  active: number;
}

export interface DashboardSyncSource {
  _id: string;
  name: string;
  type: string;
  url: string;
}

export interface DashboardTriggeredBy {
  _id: string;
  username: string;
}

export interface LatestSync {
  _id: string;
  source: DashboardSyncSource;
  triggeredBy: DashboardTriggeredBy;
  status: "running" | "success" | "failed";
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

export interface DashboardStats {
  totalIOC: number;
  iocByType: IOCTypeStat[];
  sources: DashboardSources;
  latestSync: LatestSync | null;
}

export interface DashboardResponse {
  totalIOC: number;
  iocByType: IOCTypeStat[];
  sources: DashboardSources;
  latestSync: LatestSync | null;
}