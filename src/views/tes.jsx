import React, { useEffect, useState } from "react";
import { createEvent, getAllEvents } from "../server/event"; // sesuaikan path

function EventPage() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await getAllEvents();
      setEvents(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent(
        formData.name,
        formData.location,
        formData.description,
        formData.image
      );
      setFormData({
        name: "",
        location: "",
        description: "",
        image: "",
      });
      loadEvents(); // refresh event list
    } catch (err) {
      console.error("Gagal buat event:", err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Buat Event</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "40px" }}>
        <input
          type="text"
          name="name"
          placeholder="Nama Event"
          value={formData.name}
          onChange={handleChange}
          required
        /><br />
        <input
          type="text"
          name="location"
          placeholder="Lokasi"
          value={formData.location}
          onChange={handleChange}
          required
        /><br />
        <textarea
          name="description"
          placeholder="Deskripsi"
          value={formData.description}
          onChange={handleChange}
          required
        /><br />
        <input
          type="text"
          name="image"
          placeholder="Link Gambar"
          value={formData.image}
          onChange={handleChange}
        /><br />
        <button type="submit">Tambah Event</button>
      </form>

      <h2>Daftar Event</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: "20px" }}>
            <strong>{event.name}</strong><br />
            Lokasi: {event.location}<br />
            Deskripsi: {event.description}<br />
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                width={200}
                style={{ marginTop: "10px" }}
              />
            )}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventPage;
