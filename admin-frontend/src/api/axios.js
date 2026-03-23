import axios from "axios";
import { getAdminToken } from "../utils/auth";

const api = axios.create({
  baseURL: "https://mvp-backend-3rq1.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


// https://mvp-backend-3rq1.onrender.com/api
