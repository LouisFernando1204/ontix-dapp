import axios from "axios";
import { BACKEND_API_URL } from "../global/global";

export async function createHistory(idEvent, idTicket, account) {
  const response = await axios.post(`${BACKEND_API_URL}history`, {
    idEvent,
    idTicket,
    account,
  });
  return response;
}

export async function getAllHistories() {
  const response = await axios.get(`${BACKEND_API_URL}history`);
  return response;
}

export async function deleteHistory(id) {
  const response = await axios.delete(`${BACKEND_API_URL}history/${id}`);
  return response;
}

export async function updateHistory(id, idEvent, idTicket, account) {
  const response = await axios.put(`${BACKEND_API_URL}history/${id}`, {
    idEvent,
    idTicket,
    account,
  });
  return response;
}
