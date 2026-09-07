// Các loại IOC hệ thống hỗ trợ
export type IOCType =
  | "IP"
  | "DOMAIN"
  | "URL"
  | "HASH";

// Mức độ nguy hiểm
export type IOCSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

// Thông tin Source được populate từ MongoDB
export interface IOCSource {
  _id: string;
  name: string;
  type: "API" | "RSS";
  url: string;
}

// IOC
export interface IOC {
  _id: string;
  type: IOCType;
  value: string;
  description: string;
  severity: IOCSeverity;
  source: IOCSource | string;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// Response GET /api/iocs
export interface IOCListResponse {
  iocs: IOC[];
  total?: number;
  page?: number;
  limit?: number;
}

// Response khi lấy một IOC
export interface IOCResponse {
  ioc: IOC;
}

// Dữ liệu tạo IOC
export interface CreateIOCRequest {
  type: IOCType;
  value: string;
  description?: string;
  severity?: IOCSeverity;
  source: string;
}

// Dữ liệu cập nhật IOC
export interface UpdateIOCRequest {
  type?: IOCType;
  value?: string;
  description?: string;
  severity?: IOCSeverity;
  source?: string;
}