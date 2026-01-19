// src/lib/api.js
// ⚠️ BU YERGA SIZNING RENDER BACKEND URL NI YOZING!
const PRODUCTION_API_URL = "https://uzwork-backend.onrender.com"; // ← O'zgartiring!

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? PRODUCTION_API_URL
    : "http://localhost:3000");

console.log('🌐 API URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

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

  // Agar token muddati tugagan bo'lsa – login ga yo'naltir
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/admin/login";
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Xato yuz berdi");
  }

  return data;
};

// POST method
api.post = async (endpoint, body) => {
  return api(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// GET method
api.get = async (endpoint) => {
  return api(endpoint, {
    method: "GET",
  });
};

// PUT method
api.put = async (endpoint, body) => {
  return api(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

// PATCH method
api.patch = async (endpoint, body) => {
  return api(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

// DELETE method
api.delete = async (endpoint) => {
  return api(endpoint, {
    method: "DELETE",
  });
};

export default api;