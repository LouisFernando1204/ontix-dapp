import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export async function createHistory(idEvent, idTicket, account) {
  const response = await axios.post(`${BACKEND_API_URL}/api/history`, {
    idEvent,
    idTicket,
    account,
  });
  console.log("createHistory Response:", response);
  return response;
}

export async function getAllHistories() {
  const response = await axios.get(`${BACKEND_API_URL}/api/history`);
  console.log("getAllHistories Response:", response);
  return response;
}

export async function deleteHistory(id) {
  const response = await axios.delete(`${BACKEND_API_URL}/api/history/${id}`);
  console.log("deleteHistory Response:", response);
  return response;
}

export async function updateHistory(id, idEvent, idTicket, account) {
  const response = await axios.put(`${BACKEND_API_URL}/api/history/${id}`, {
    idEvent,
    idTicket,
    account,
  });
  console.log("updateHistory Response:", response);
  return response;
}