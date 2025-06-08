import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export async function createNewEvent(name, location, description, image) {
  const response = await axios.post(`${BACKEND_API_URL}/api/events`, {
    name,
    location,
    description,
    image,
  });
  console.log("createNewEvent Response:", response);
  return response;
}

export async function getAllEvents() {
  const response = await axios.get(`${BACKEND_API_URL}/api/events`);
  console.log("getAllEvents Response:", response);
  return response;
}

export async function deleteEvent(id) {
  const response = await axios.delete(`${BACKEND_API_URL}/api/events/${id}`);
  console.log("deleteEvent Response:", response);
  return response;
}

export async function updateEvent(id, name, location, description, image) {
  const response = await axios.put(`${BACKEND_API_URL}/api/events/${id}`, {
    name,
    location,
    description,
    image,
  });
  console.log("updateEvent Response:", response);
  return response;
}