// src/utils/socket.js
import { io } from "socket.io-client";

// Local/Production uchun env orqali boshqaramiz
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

console.log("🔌 SOCKET URL:", SOCKET_URL);

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // siz connect() ni qo'lda chaqiryapsiz
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
