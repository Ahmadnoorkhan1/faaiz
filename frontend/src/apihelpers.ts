// apiHelpers.ts

import axios from "axios";
import api from "./service/apiService";
// import { useAuth } from "./utils/AuthContext";

// const { user } = useAuth();

// 1. Create a project with hardcoded values
export const createProject = async (userId: string, clientId: string, serviceName: string) => {
    console.log("client id", clientId);
  const payload = {
    name: "Demo Organization - Demo Service",
    description: "Demo Service implementation for Demo Organization",
    status: "ACTIVE",
    clientId: clientId,
    userId: userId,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
  };

  const response = await api.post("/api/projects", payload);
  return response.data.data.id;
};

// 2. Get documents by service type
export const getDocumentsByService = async (serviceType: string) => {
  const response = await api.get(`/api/documents/by-service/${serviceType}`);
  return response.data;
};

// 3. Download a file by URL
export const downloadFile = async (url: string): Promise<File | null> => {
  try {
    const fileName = url.split("/").pop() || "template.xlsx";
    const response = await axios.get(url, { responseType: "blob" });

    return new File([response.data], fileName, {
      type: response.headers["content-type"] || "application/octet-stream",
    });
  } catch (error) {
    console.error("Failed to download file:", error);
    return null;
  }
};

// 4. Upload and import tasks
export const importTasks = async (file: File, projectId: string, userId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectId", projectId);
  formData.append("userId", userId);

const response = await api.post("/api/tasks/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};