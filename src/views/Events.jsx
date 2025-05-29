import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";

const Events = () => {
  const [eventsOri, setEventsOri] = useState([]);
  const [eventsResell, setEventsResell] = useState([]);
  const [viewType, setViewType] = useState("official");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    imageFiles: [],
  });

  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const official = [
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          image: ["https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg"],
        },
      ];

      const resellers = [
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          image: ["https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg"],
          resellerName: "Lofer",
        },
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          image: ["https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg"],
          resellerName: "Joed",
        },
      ];

      setEventsOri(official);
      setEventsResell(resellers);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleImageUpload = (e) => {
    setFormData({ ...formData, imageFiles: Array.from(e.target.files) });
  };

  if (loading) return <LoadingScreen />;

  const events = viewType === "official" ? eventsOri : eventsResell;

  if (events.length === 0) return <EmptyPage text="No upcoming events found." />;

  return (
    <div className="flex flex-col items-start px-12 py-16 w-full relative">

      {/* Header Row */}
      <div className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-semibold text-darkOrange">Upcoming Events</h1>
          <select
            className="border pl-4 py-2 rounded-lg text-gray-700"
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="official">Official</option>
            <option value="resell">Reseller  </option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        >
          Add Event +
        </button>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {events.map((event, index) => (
          <motion.div
            key={`${event.idEvent}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer relative"
            onClick={() => navigate(`/event/${event.idEvent}`)}
          >
            {viewType === "resell" && (
              <div className="absolute top-2 right-2 bg-pink-600 text-white text-md px-2 py-1 rounded shadow">
                Reseller
              </div>
            )}
            <img
              src={`${event.image[0]}`}
              alt={event.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-pink-600 mb-1">{event.name}</h3>
              <p className="text-white mb-2">{event.location}</p>
              <p className="text-sm text-white line-clamp-3">{event.description}</p>
              {viewType === "resell" && <p className="text-sm text-gray-300 mt-2 italic">By: {event.resellerName}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm backdrop-saturate-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-darkOrange">Create New Event</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="w-full border px-3 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" className="w-full border px-3 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea className="w-full border px-3 py-3 rounded-lg" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Image(s)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="w-full flex justify-center border px-8 py-4 rounded-lg" />
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
