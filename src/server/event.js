import axios from "axios";
import { BACKEND_API_URL } from "../global/global";

export async function createEvent(name, location, description, image) {
  const response = await axios.post(`${BACKEND_API_URL}events`, {
    name,
    location,
    description,
    image,
  });
  return response;
}

export async function getAllEvents() {
  const response = await axios.get(`${BACKEND_API_URL}events`);
  return response;
}

export async function deleteEvent(id) {
  const response = await axios.delete(`${BACKEND_API_URL}events/${id}`);
  return response;
}

export async function updateEvent(id, name, location, description, image) {
  const response = await axios.put(`${BACKEND_API_URL}events/${id}`, {
    name,
    location,
    description,
    image,
  });
  return response;
}
