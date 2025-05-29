import { useEffect, useState } from "react";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQHhqBAFF3Nf6A/profile-displayphoto-shrink_200_200/B56ZYn7tVSGUAY-/0/1744426687169?e=2147483647&v=beta&t=KMGPA4JnN-NbNXWzKUSvi_t3YjSZ-HVDOz2eQosHT3Q",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQHhqBAFF3Nf6A/profile-displayphoto-shrink_200_200/B56ZYn7tVSGUAY-/0/1744426687169?e=2147483647&v=beta&t=KMGPA4JnN-NbNXWzKUSvi_t3YjSZ-HVDOz2eQosHT3Q",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQFS8JOOttSQGA/profile-displayphoto-shrink_200_200/B56ZW9XjWnHsAY-/0/1742638824287?e=2147483647&v=beta&t=K-w0pieJJ_yKXT0EIgQ37GdkjzPeLnbilGp_I8wm9pQ",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQFS8JOOttSQGA/profile-displayphoto-shrink_200_200/B56ZW9XjWnHsAY-/0/1742638824287?e=2147483647&v=beta&t=K-w0pieJJ_yKXT0EIgQ37GdkjzPeLnbilGp_I8wm9pQ",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQFS8JOOttSQGA/profile-displayphoto-shrink_200_200/B56ZW9XjWnHsAY-/0/1742638824287?e=2147483647&v=beta&t=K-w0pieJJ_yKXT0EIgQ37GdkjzPeLnbilGp_I8wm9pQ",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description:
            "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://media.licdn.com/dms/image/v2/D5603AQFS8JOOttSQGA/profile-displayphoto-shrink_200_200/B56ZW9XjWnHsAY-/0/1742638824287?e=2147483647&v=beta&t=K-w0pieJJ_yKXT0EIgQ37GdkjzPeLnbilGp_I8wm9pQ",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZtTCDLk7JDWBnplZLbkNvxrdP9tS0DJrjw&s",
          ],
        },

      ];

      setEvents(mockData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <LoadingScreen />;
  if (events.length === 0) return <EmptyPage text="No upcoming events found." />;

  return (
    <div className="flex flex-col items-start px-4 md:px-12 py-16 min-h-screen">
      <h1 className="text-3xl font-semibold text-darkOrange mb-8">
        Upcoming Events
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {events.map((event) => (
          <motion.div
            key={event.idEvent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => navigate(`/event/${event.idEvent}`)}
          >
            <img
              src={event.image[0]}
              alt={event.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-darkOrange mb-1">
                {event.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{event.location}</p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {event.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Events;