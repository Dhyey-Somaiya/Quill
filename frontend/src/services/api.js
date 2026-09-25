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
  create: (payload) => api.post("/tags", payload),
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

export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (payload) => api.patch("/users/me", payload),
  getById: (id) => api.get(`/users/${id}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  listAll: () => api.get("/users"),
  toggleStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
};

export const categoryAdminApi = {
  create: (payload) => api.post("/categories", payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const tagAdminApi = {
  update: (id, payload) => api.put(`/tags/${id}`, payload),
  delete: (id) => api.delete(`/tags/${id}`),
};

export const commentAdminApi = {
  delete: (id) => api.delete(`/comments/${id}`),
  approve: (id, isApproved) => api.put(`/comments/${id}`, { isApproved }),
};

export default api;

