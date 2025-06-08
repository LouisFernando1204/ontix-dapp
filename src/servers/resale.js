import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export async function createResale(idEvent, idTicket) {
  const response = await axios.post(`${BACKEND_API_URL}/api/resale`, {
    idEvent,
    idTicket,
  });
  console.log("createResale Response:", response);
  return response;
}

export async function getAllResales() {
  const response = await axios.get(`${BACKEND_API_URL}/api/resale`);
  console.log("getAllResales Response:", response);
  return response;
}

export async function deleteResale(id) {
  const response = await axios.delete(`${BACKEND_API_URL}/api/resale/${id}`);
  console.log("deleteResale Response:", response);
  return response;
}

export async function updateResale(id, idEvent, idTicket) {
  const response = await axios.put(`${BACKEND_API_URL}/api/resale/${id}`, {
    idEvent,
    idTicket,
  });
  console.log("updateResale Response:", response);
  return response;
}