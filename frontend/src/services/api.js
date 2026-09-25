import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("quill_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/users/me"),
};

export const postsApi = {
  list: (params = {}) => api.get("/posts", { params }),
  get: (id) => api.get(`/posts/${id}`),
  create: (payload) => api.post("/posts", payload),
  update: (id, payload) => api.put(`/posts/${id}`, payload),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),
};

export const categoriesApi = {
  list: () => api.get("/categories"),
};

export const tagsApi = {
  list: () => api.get("/tags"),
};

export const commentsApi = {
  list: (postId) => api.get("/comments", { params: { postId } }),
  create: (payload) => api.post("/comments", payload),
  update: (id, payload) => api.put(`/comments/${id}`, payload),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const bookmarksApi = {
  list: () => api.get("/users/me/bookmarks"),
  add: (id) => api.post(`/users/bookmarks/${id}`),
  remove: (id) => api.delete(`/users/bookmarks/${id}`),
};

export default api;
