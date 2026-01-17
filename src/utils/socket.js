// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // backend URL

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false // faqat login bo‘lganda ulanadi
});

export default socket;