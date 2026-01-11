// src/lib/api.js
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

  // Agar token muddati tugagan bo‘lsa – login ga yo‘naltir
  // if (response.status === 401) {
  //   localStorage.removeItem("accessToken");
  //   window.location.href = "/admin/login";
  //   return;
  // }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Xato yuz berdi");
  }

  return data;
};

export default api;