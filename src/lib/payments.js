// src/api/payments.js
import api from "./api";

const BASE = "/payments";

export const fetchMyPayments = (params) => api.get(BASE, { params });

export const fetchPaymentDetail = (id) => api.get(`${BASE}/${id}`);

export const fetchMyBalance = () => api.get(`${BASE}/balance`);

export const createDeposit = (payload) => api.post(`${BASE}/deposit`, payload);

export const createWithdraw = (payload) => api.post(`${BASE}/withdraw`, payload);
