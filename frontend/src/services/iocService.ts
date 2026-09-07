import api from "@/services/api";

import type {
  IOC,
  IOCListResponse,
  IOCResponse,
  CreateIOCRequest,
  UpdateIOCRequest,
} from "@/types/ioc";


  //GET /api/iocs
 
export const getIOCs = async (): Promise<IOC[]> => {
  const response = await api.get<IOCListResponse>("/iocs");

  return response.data.iocs;
};


  //GET /api/iocs/:id
 
export const getIOCById = async (id: string): Promise<IOC> => {
  const response = await api.get<IOCResponse>(`/iocs/${id}`);

  return response.data.ioc;
};


 // POST /api/iocs
 
export const createIOC = async (
  data: CreateIOCRequest
): Promise<IOC> => {
  const response = await api.post<IOCResponse>(
    "/iocs",
    data
  );

  return response.data.ioc;
};


 // PUT /api/iocs/:id
 
export const updateIOC = async (
  id: string,
  data: UpdateIOCRequest
): Promise<IOC> => {
  const response = await api.put<IOCResponse>(
    `/iocs/${id}`,
    data
  );

  return response.data.ioc;
};


// DELETE /api/iocs/:id
 
export const deleteIOC = async (
  id: string
): Promise<void> => {
  await api.delete(`/iocs/${id}`);
};