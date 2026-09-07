// Loại nguồn dữ liệu
export type SourceType = "API" | "RSS";

// Source
export interface Source {
  _id: string;
  name: string;
  type: SourceType;
  url: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response danh sách Source
export interface SourceListResponse {
  sources: Source[];
}

// Response một Source
export interface SourceResponse {
  source: Source;
}

// Dữ liệu tạo Source
export interface CreateSourceRequest {
  name: string;
  type: SourceType;
  url: string;
  enabled?: boolean;
}

// Dữ liệu cập nhật Source
export interface UpdateSourceRequest {
  name?: string;
  type?: SourceType;
  url?: string;
  enabled?: boolean;
}