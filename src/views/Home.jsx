/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import image1 from "/src/assets/home_1.jpg";
import image2 from "/src/assets/home_2.jpg";
import image3 from "/src/assets/home_3.jpg";
import { errorMessage, formatDuration, normalModal } from "../utils/helper";
import { getAllEvents } from "../servers/event";
import { getEventDetail } from "../services/event";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "./EmptyPage";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const images = [image1, image2, image3];

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onTixBenefits = [
    {
      header: "Decentralized Ownership",
      description: "Your tickets are NFTs – own them, trade them, or store them securely.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      header: "No Middlemen",
      description: "No third-party fees. Buy and sell tickets peer-to-peer, instantly.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      header: "Built on Web3",
      description: "Utilizes blockchain and smart contracts for full transparency.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    },
  ];

  const errorScenario = (errorMsg = "Unexpected Error. Please try again later!") => {
    setIsLoading(false);
    if (!isLoading) {
      setTimeout(() => {
        normalModal("error", "Oops...", errorMsg);
      }, 1000);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await getAllEvents();
      if (res) {
        const allEvents = await Promise.all(
          res.data.map(async (event, _) => {
            const data = await getEventDetail(event._id);
            return {
              id: event._id,
              name: event.name,
              location: event.location,
              description: event.description,
              images: event.image,
              startTime: data.startTime,
              endTime: data.endTime,
              ticketPrice: data.ticketPrice,
              maxTickets: data.maxTickets,
              resaleStart: data.resaleStart,
              resaleEnd: data.resaleEnd,
              resalePriceCap: data.resalePriceCap,
              creator: data.creator,
              ticketsSold: data.ticketsSold
            };
          })
        );
        setEvents(allEvents);
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.response && error.response.data && error.response.data.message) {
        return errorScenario(error.response.data.message);
      } else if (error.reason) {
        return errorScenario(errorMessage(error));
      } else {
        return errorScenario(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <div className="font-lato w-full -mt-12 md:-mt-24">
        <div className="relative w-full overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-full flex-shrink-0 shadow-lg h-screen object-cover"
              />
            ))}
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-0"></div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-center"
            >
              Revolutionizing Events with NFTs & Web3
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-md md:text-lg lg:text-xl px-12 lg:px-56 text-center"
            >
              OnTix is a blockchain-based ticketing platform where event organizers can issue tickets as NFTs — fully owned, tradable, and secure, without middlemen.
            </motion.h2>
          </motion.div>
        </div>
      </div>

      <section className="pt-16 px-10 md:px-16 lg:px-24">
        <h2 className="text-3xl font-bold text-darkOrange text-center mb-8">
          Why OnTix is the Future of Event Ticketing?
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {onTixBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="cursor-pointer rounded-lg"
            >
              <div className="text-center p-6 bg-black text-secondary backdrop-blur-lg rounded-xl shadow-lg transition-all hover:scale-105 duration-500 ease-in-out hover:shadow-2xl">
                <div className="flex items-center justify-center mb-4">
                  {benefit.icon()}
                </div>
                <h3 className="text-xl text-pink-500 font-semibold mb-2">{benefit.header}</h3>
                <p>{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-10 md:px-16 lg:px-24 pt-24 pb-16">
        <h2 className="text-3xl text-center font-bold text-darkOrange mb-6">Featured Events</h2>
        {events.length === 0 ? (
          <EmptyPage text="No events available yet. Please check back later." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer relative"
                onClick={() => navigate(`/event/${event.id}?by=official`)}
              >
                <div className="absolute top-2 right-2 text-white text-md px-2 py-1 rounded shadow bg-blue-600">
                  Official
                </div>
                <img
                  src={event.images[0]}
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
                  <p className="text-sm text-gray-300">
                    {formatDuration(event.startTime, event.endTime)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </>
  );
};

export default Home;