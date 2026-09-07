import api from "@/services/api";

import type {
  Source,
  SourceListResponse,
  SourceResponse,
  CreateSourceRequest,
  UpdateSourceRequest,
} from "@/types/source";


 //GET /api/sources
 
export const getSources = async (): Promise<Source[]> => {
  const response =
    await api.get<SourceListResponse>("/sources");

  return response.data.sources;
};


  //GET /api/sources/:id
 
export const getSourceById = async (
  id: string
): Promise<Source> => {
  const response =
    await api.get<SourceResponse>(`/sources/${id}`);

  return response.data.source;
};


 // POST /api/sources
 
export const createSource = async (
  data: CreateSourceRequest
): Promise<Source> => {
  const response = await api.post<SourceResponse>(
    "/sources",
    data
  );

  return response.data.source;
};


 //PUT /api/sources/:id
 
export const updateSource = async (
  id: string,
  data: UpdateSourceRequest
): Promise<Source> => {
  const response = await api.put<SourceResponse>(
    `/sources/${id}`,
    data
  );

  return response.data.source;
};


 // DELETE /api/sources/:id
 
export const deleteSource = async (
  id: string
): Promise<void> => {
  await api.delete(`/sources/${id}`);
};