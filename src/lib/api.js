// src/lib/api.js

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "❌ VITE_API_URL is not defined. Create .env.local and set VITE_API_URL=http://localhost:3000"
  );
}

console.log("🌐 API URL:", API_URL);
console.log("🔧 Environment:", import.meta.env.MODE);

const getToken = () => localStorage.getItem("accessToken");

const api = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Token muddati tugagan bo'lsa – login ga yo'naltir
  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/admin/login";
    return;
  }

  // Ba'zi holatlarda response bo'sh bo'lishi mumkin (204, va h.k.)
  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    throw new Error((data && data.message) || "Xato yuz berdi");
  }

  return data;
};

// POST method
api.post = async (endpoint, body, options = {}) => {
  return api(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
};

// GET method
api.get = async (endpoint, options = {}) => {
  return api(endpoint, {
    method: "GET",
    ...options,
  });
};

// PUT method
api.put = async (endpoint, body, options = {}) => {
  return api(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
};

// PATCH method
api.patch = async (endpoint, body, options = {}) => {
  return api(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
};

// DELETE method
api.delete = async (endpoint, options = {}) => {
  return api(endpoint, {
    method: "DELETE",
    ...options,
  });
};

export default api;
