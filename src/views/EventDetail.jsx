import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/ui/loading-screen";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      // Replace this with real API call
      const mockData = [
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description: "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://example.com/images/event001-1.jpg",
            "https://example.com/images/event001-2.jpg"
          ],
        },
      ];
      const found = mockData.find((e) => e.idEvent === id);
      setEvent(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading || !event) return <LoadingScreen />;

  return (
    <div className="px-6 md:px-12 lg:px-24 py-12">
      <h1 className="text-3xl font-bold text-darkOrange mb-6">{event.name}</h1>
      <p className="text-gray-600 mb-2">{event.location}</p>
      <p className="text-gray-800 mb-6">{event.description}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {event.image.map((img, idx) => (
          <img key={idx} src={img} alt={`Event ${idx + 1}`} className="rounded-lg shadow" />
        ))}
      </div>
    </div>
  );
};

export default EventDetail;
