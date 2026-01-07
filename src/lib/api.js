// src/lib/api.js (admin panel uchun)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => localStorage.getItem("accessToken");

const api = async (endpoint, options = {}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Token muddati tugagan – login ga yo‘naltirish
    localStorage.removeItem("accessToken");
    window.location.href = "/admin/login";
    return;
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Xato");

  return data;
};

export default api;