import axios from "axios";
import { BACKEND_API_URL } from "../global/global";

export async function createResale(idEvent, idTicket) {
  const response = await axios.post(`${BACKEND_API_URL}resale`, {
    idEvent,
    idTicket,
  });
  return response;
}

export async function getAllResales() {
  const response = await axios.get(`${BACKEND_API_URL}resale`);
  return response;
}

export async function deleteResale(id) {
  const response = await axios.delete(`${BACKEND_API_URL}resale/${id}`);
  return response;
}

export async function updateResale(id, idEvent, idTicket) {
  const response = await axios.put(`${BACKEND_API_URL}resale/${id}`, {
    idEvent,
    idTicket,
  });
  return response;
}
