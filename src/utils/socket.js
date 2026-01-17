// src/utils/socket.js
import { io } from "socket.io-client";

// Production va development uchun avto-tanlash
// eslint-disable-next-line no-undef
const SOCKET_URL = "https://uzwork-backend.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling'], // websocket birinchi bo‘lsin
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;