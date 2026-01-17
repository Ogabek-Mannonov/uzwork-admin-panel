// src/utils/socket.js
import { io } from "socket.io-client";

// Production va development uchun avto-tanlash
const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? "https://uzwork-backend.onrender.com"  // Render.com backend URL
  : "http://localhost:3000";               // localda ishlatish uchun

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling'], // websocket birinchi bo‘lsin
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;