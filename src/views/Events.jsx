import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";
import { Dialog } from "@headlessui/react";

const Events = () => {
  const [eventsOri, setEventsOri] = useState([]);
  const [eventsResell, setEventsResell] = useState([]);
  const [viewType, setViewType] = useState("official");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    eventOrganizer: "",
    ticketPrice: "",
    startTime: "",
    endTime: "",
    resaleEnd: "",
    description: "",
    image: []
  });

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const official = [
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          eventOrganizer: "Tech Foundation",
          resellerName: null,
          ticketPrice: "0.08",
          startTime: "2025-04-30",
          endTime: "2025-06-30",
          resaleEnd: "2025-07-05",
          image: [
            "https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg",
            "/public/images/home_3.jpg",
            "https://dynamicmedia.livenationinternational.com/Media/c/g/u/3afea2b8-76d6-4884-a2f4-1bcf58c53f60.jpg?format=webp&width=3840&quality=75"
          ],
        }
      ];

      const resellers = [
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          eventOrganizer: "Tech Foundation",
          resellerName: "Lofer",
          ticketPrice: "0.11",
          startTime: "2025-04-30",
          endTime: "2025-06-30",
          image: ["/images/home_1.jpg"]
        },
        {
          idEvent: "1230",
          name: "Nulbarich CLOSE A CHAPTER",
          location: "BUDOKAN",
          description: "A premier event showcasing the latest in tech innovation.",
          eventOrganizer: "Tech Foundation",
          resellerName: "Joed",
          ticketPrice: "0.10",
          startTime: "2025-04-30",
          endTime: "2025-06-30",
          image: [
            "https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg",
            "/public/images/home_3.jpg",
            "https://dynamicmedia.livenationinternational.com/Media/c/g/u/3afea2b8-76d6-4884-a2f4-1bcf58c53f60.jpg?format=webp&width=3840&quality=75"
          ],
        }
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

  const handleCreateEvent = () => {
    setEventsOri(prev => [...prev, { idEvent: Date.now().toString(), resellerName: null, image: formData.image, ...formData }]);
    setShowModal(false);
    setFormData({ name: "", location: "", eventOrganizer: "", ticketPrice: "", startTime: "", endTime: "", resaleEnd: "", description: "", image: [] });
  };

  if (loading) return <LoadingScreen />;

  const events = viewType === "official" ? eventsOri : eventsResell;

  if (events.length === 0) return <EmptyPage text="No upcoming events found." />;

  return (
    <div className="flex flex-col items-start px-12 py-16 w-full relative">
      <div className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-semibold text-darkOrange">Upcoming Events</h1>
          <select
            className="border pl-4 py-2 rounded-lg text-gray-700"
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="official">Official</option>
            <option value="resell">Reseller</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        >
          Add Event +
        </button>
      </div>

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
            <div className={`absolute top-2 right-2 text-white text-md px-2 py-1 rounded shadow ${event.resellerName ? 'bg-amber-600' : 'bg-blue-600'}`}>
              {event.resellerName ? 'Reseller' : 'Official'}
            </div>
            <img
              src={`${event.image[0]}`}
              alt={event.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-pink-600 mb-1">{event.name}</h3>
              <div className="flex items-center text-white mb-1 space-x-2">
                <span className="font-medium">{event.ticketPrice} ETH</span>
                <span>•</span>
                <span>{event.location}</span>
              </div>
              {(() => {
                const now = new Date();
                const end = new Date(event.endTime);
                const timeDiff = Math.max(end - now, 0);
                const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                return (
                  <p className="text-sm text-gray-300">
                    {formatDate(event.endTime)} ({daysLeft} day{daysLeft !== 1 ? "s" : ""} left)
                  </p>
                );
              })()}
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl z-50">
          <Dialog.Title className="text-xl font-bold mb-4 text-center">Create New Event</Dialog.Title>
          <div className="grid grid-cols-2 gap-4">
            <input className="border px-3 py-2 rounded" placeholder="Event Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input className="border px-3 py-2 rounded" placeholder="Location" onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <input className="border px-3 py-2 rounded" placeholder="Organizer" onChange={(e) => setFormData({ ...formData, eventOrganizer: e.target.value })} />
            <input className="border px-3 py-2 rounded" placeholder="Ticket Price (ETH)" onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })} />
            <div className="flex flex-col">
              <label className="text-sm mb-1">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded" onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">End Date</label>
              <input type="date" className="border px-3 py-2 rounded" onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="text-sm mb-1">Resale End</label>
              <input type="date" className="border px-3 py-2 rounded" onChange={(e) => setFormData({ ...formData, resaleEnd: e.target.value })} />
            </div>
            <div className="col-span-2">
              <input className="border px-3 py-2 rounded w-full" placeholder="Short Description" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm mb-1">Upload Image</label>
              <input type="file" className="border px-3 py-2 rounded w-full" onChange={e => setFormData({ ...formData, image: [URL.createObjectURL(e.target.files[0])] })} />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
            <button onClick={handleCreateEvent} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Create Event</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Events;
