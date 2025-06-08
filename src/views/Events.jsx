/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";
import { Dialog } from "@headlessui/react";
import { errorMessage, formatDuration, generateQrCodeBlob, normalModal, successModal } from "../utils/helper";
import { pinata } from "../global/global";
import { createNewEvent, deleteEvent, getAllEvents } from "../servers/event";
import { createEvent, getEventDetail } from "../services/event";
import { getNextTicketId } from "../services/event";
import axios from "axios";
import { getAllResales } from "../servers/resale";
import { getResalePrice, getResaleSeller } from "../services/resale";

const Events = ({ walletProvider, connectedAddress }) => {
  const [eventsOfficial, setEventsOfficial] = useState([]);
  const [eventsResell, setEventsResell] = useState([]);
  const [eventsConnectedAddress, setEventsConnectedAddress] = useState([]);
  const [viewType, setViewType] = useState("official");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updateEvents, setUpdateEvents] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [ticketPrice, setTicketPrice] = useState(0);
  const [resalePriceCap, setResalePriceCap] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [resaleStart, setResaleStart] = useState(0);
  const [resaleEnd, setResaleEnd] = useState(0);
  const [maxTickets, setMaxTickets] = useState(0);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEventsOfficial();
    fetchEventsResell();
    if (connectedAddress) {
      fetchEventConnectedAddress();
    }
  }, [updateEvents, connectedAddress]);

  const checkInput = () => {
    if (
      name == "" ||
      description == "" ||
      location == "" ||
      ticketPrice == 0 ||
      resalePriceCap == 0 ||
      startTime == "" ||
      endTime == "" ||
      resaleStart == "" ||
      resaleEnd == "" ||
      maxTickets == 0 ||
      images.length == 0
    ) {
      normalModal(
        "error",
        "Oops..",
        "Something’s missing or incorrect. Let’s make it perfect—double-check your input!"
      );
      return false;
    }
    return true;
  };

  const cleanInput = () => {
    setName("");
    setDescription("");
    setLocation("");
    setTicketPrice(0);
    setResalePriceCap(0);
    setStartTime("");
    setEndTime("");
    setResaleStart("");
    setResaleEnd("");
    setMaxTickets(0);
    setImages([]);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImages((prevImages) => [...prevImages, ...fileArray]);
    }
  };

  const uploadImageToPinata = async () => {
    try {
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const upload = await pinata.upload.url(image, {
            pinataMetadata: {
              name: image
            }
          });
          return `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
        })
      );
      return { uploadedImages };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const errorScenario = (errorMsg = "Unexpected Error. Please try again later!") => {
    setShowModal(false);
    setIsLoading(false);
    if (!isLoading) {
      setTimeout(() => {
        normalModal("error", "Oops...", errorMsg);
      }, 1000);
    }
  };

  const generateTokenURIs = async (maxTickets) => {
    const startTicketId = await getNextTicketId();
    const tokenURIs = [];
    for (let i = 0; i < maxTickets; i++) {
      const ticketId = startTicketId + i;
      const qrBlob = await generateQrCodeBlob(`Verification for Ticket Id #${ticketId}`, ticketId);
      console.log("qrBlob:", qrBlob);
      const formData = new FormData();
      formData.append("file", qrBlob);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      const uploadResponse = await axios.post(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL, formData);
      console.log(uploadResponse);
      const imageUrl = uploadResponse.data.secure_url;
      const metadata = {
        name: `Ticket #${ticketId} - ${name}`,
        description: `${description}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Event", value: name },
          { trait_type: "Location", value: location },
          { trait_type: "Ticket ID", value: ticketId },
          { trait_type: "Start Time", value: startTime },
          { trait_type: "End Time", value: endTime }
        ]
      };
      const jsonUpload = await pinata.upload.json(metadata, {
        pinataMetadata: {
          name: `metadata-ticket-${ticketId}`
        }
      });
      const metadataIpfsUrl = `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`;
      tokenURIs.push(metadataIpfsUrl);
    }
    return tokenURIs;
  };

  const handleCreateNewEvent = async () => {
    setIsLoading(true);
    const success = checkInput();
    let res;
    if (success) {
      try {
        const { uploadedImages } = await uploadImageToPinata();
        const tokenURIs = await generateTokenURIs(maxTickets);
        if (tokenURIs) {
          console.log("tokenURIs:", tokenURIs);
          res = await createNewEvent(
            name,
            location,
            description,
            uploadedImages
          );
          if (res.status == 200) {
            try {
              const tx = await createEvent(
                res.data.savedEvent._id,
                startTime,
                endTime,
                ticketPrice,
                maxTickets,
                resaleStart,
                resaleEnd,
                resalePriceCap,
                tokenURIs,
                walletProvider
              );
              if (tx) {
                cleanInput();
                setShowModal(false);
                setIsLoading(false);
                setUpdateEvents(prev => !prev);
                console.log("eventId:", tx.data.event.eventId);
                console.log("creator:", tx.data.event.creator);
                setTimeout(() => {
                  successModal("Event Created Successfully!", tx.data.hash, [
                    {
                      eventId: tx.data.event.eventId,
                      creator: tx.data.event.creator
                    }
                  ]);
                }, 1000);
              } else {
                cleanInput();
                setShowModal(false);
                setIsLoading(false);
                await deleteEvent(res.data.savedEvent._id);
                errorScenario("Failed to get transaction hash.");
              }
            } catch (error) {
              console.log(error);
              cleanInput();
              setShowModal(false);
              setIsLoading(false);
              await deleteEvent(res.data.savedEvent._id);
              errorScenario(errorMessage(error));
            }
          } else {
            const backendMessage = res?.data?.message || "Failed to create event in backend.";
            cleanInput();
            setShowModal(false);
            setIsLoading(false);
            errorScenario(backendMessage);
          }
        } else {
          cleanInput();
          setShowModal(false);
          setIsLoading(false);
          errorScenario("Failed to create Token URIs.");
        }
      } catch (error) {
        console.log(error);
        let errorMsg = "An unexpected error occurred.";
        await deleteEvent(res.data.savedEvent._id);
        cleanInput();
        setShowModal(false);
        setIsLoading(false);
        if (error.response && error.response.data && error.response.data.message) {
          return errorScenario(error.response.data.message);
        }
        if (error.reason) {
          return errorScenario(errorMessage(error));
        }
        return errorScenario(errorMsg);
      }
    }
  };

  const fetchEventsOfficial = async () => {
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
        setEventsOfficial(allEvents);
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.response && error.response.data && error.response.data.message) {
        return errorScenario(error.response.data.message);
      }
      if (error.reason) {
        return errorScenario(errorMessage(error));
      }
      return errorScenario(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventsResell = async () => {
    setIsLoading(true);
    try {
      const res = await getAllResales();
      if (res) {
        const allEvents = await Promise.all(
          res.data.data.map(async (event, _) => {
            const data = await getEventDetail(event.idEvent);
            const resalePrice = await getResalePrice(event.idTicket);
            console.log("resalePrice:", resalePrice);
            const resaleSeller = await getResaleSeller(event.idTicket);
            if (Number(resalePrice) > 0) {
              return {
                id: event.event._id,
                ticketId: event.idTicket,
                name: event.event.name,
                location: event.event.location,
                description: event.event.description,
                images: event.event.image,
                startTime: data.startTime,
                endTime: data.endTime,
                ticketPrice: resalePrice,
                maxTickets: data.maxTickets,
                resaleStart: data.resaleStart,
                resaleEnd: data.resaleEnd,
                creator: resaleSeller,
                ticketsSold: data.ticketsSold
              };
            }
            return null;
          })
        );
        const filteredEvents = allEvents.filter(Boolean);
        setEventsResell(filteredEvents);
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.response && error.response.data && error.response.data.message) {
        return errorScenario(error.response.data.message);
      }
      if (error.reason) {
        return errorScenario(errorMessage(error));
      }
      return errorScenario(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventConnectedAddress = async () => {
    setIsLoading(true);
    try {
      const res = await getAllEvents();
      if (res) {
        const allEvents = await Promise.all(
          res.data.map(async (event, _) => {
            const data = await getEventDetail(event._id);
            const creator = await data.creator;
            if (creator.toLowerCase() == connectedAddress.toLowerCase()) {
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
            }
            return null;
          })
        );
        const filteredEvents = allEvents.filter(Boolean);
        setEventsConnectedAddress(filteredEvents);
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.response && error.response.data && error.response.data.message) {
        return errorScenario(error.response.data.message);
      }
      if (error.reason) {
        return errorScenario(errorMessage(error));
      }
      return errorScenario(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  const events = viewType === "official"
    ? eventsOfficial
    : viewType === "reseller"
      ? eventsResell
      : viewType === "connectedAddress"
        ? eventsConnectedAddress
        : [];

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
            <option value="reseller">Reseller</option>
            <option value="connectedAddress">You</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        >
          Add Event +
        </button>
      </div>

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
              onClick={() =>
                navigate(`/event/${viewType == "official" || viewType == "connectedAddress" ? event.id : event.ticketId}?by=${viewType}`)
              }
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
                <h3 className="text-xl font-bold text-pink-600 mb-1">{event.name}, max: {event.maxTickets}, sold: {event.ticketsSold}</h3>
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

      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl z-50">
          <Dialog.Title className="text-xl font-bold mb-4 text-center">Create New Event</Dialog.Title>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border px-3 py-2 rounded"
              placeholder="Event Name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border px-3 py-2 rounded"
              placeholder="Location"
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="number"
              step="0.5"
              className="border px-3 py-2 rounded"
              placeholder="Ticket Price (ETH)"
              onChange={(e) => setTicketPrice(e.target.value)}
            />
            <input
              type="number"
              step="0.5"
              className="border px-3 py-2 rounded"
              placeholder="Resale Price Cap (ETH)"
              onChange={(e) => setResalePriceCap(e.target.value)}
            />
            <div className="flex flex-col">
              <label className="text-sm mb-1">Start Time</label>
              <input
                type="datetime-local"
                className="border px-3 py-2 rounded"
                onChange={(e) => {
                  const inputValue = e.target.value;
                  console.log("User picked datetime:", inputValue);
                  const dateObj = new Date(inputValue);
                  console.log("Converted Date object:", dateObj);
                  console.log("UNIX timestamp:", dateObj.getTime());
                  setStartTime(Math.floor(dateObj.getTime() / 1000));
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">End Time</label>
              <input
                type="datetime-local"
                className="border px-3 py-2 rounded"
                onChange={(e) => {
                  const inputValue = e.target.value;
                  console.log("User picked datetime:", inputValue);
                  const dateObj = new Date(inputValue);
                  console.log("Converted Date object:", dateObj);
                  console.log("UNIX timestamp:", dateObj.getTime());
                  setEndTime(Math.floor(dateObj.getTime() / 1000));
                }}
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="text-sm mb-1">Resale Start</label>
              <input
                type="datetime-local"
                className="border px-3 py-2 rounded"
                onChange={(e) => {
                  const inputValue = e.target.value;
                  console.log("User picked datetime:", inputValue);
                  const dateObj = new Date(inputValue);
                  console.log("Converted Date object:", dateObj);
                  console.log("UNIX timestamp:", dateObj.getTime());
                  setResaleStart(Math.floor(dateObj.getTime() / 1000));
                }}
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="text-sm mb-1">Resale End</label>
              <input
                type="datetime-local"
                className="border px-3 py-2 rounded"
                onChange={(e) => {
                  const inputValue = e.target.value;
                  console.log("User picked datetime:", inputValue);
                  const dateObj = new Date(inputValue);
                  console.log("Converted Date object:", dateObj);
                  console.log("UNIX timestamp:", dateObj.getTime());
                  setResaleEnd(Math.floor(dateObj.getTime() / 1000));
                }}
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.5"
                className="border px-3 py-2 rounded w-full"
                placeholder="Max Tickets"
                onChange={(e) => setMaxTickets(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <input
                className="border px-3 py-2 rounded w-full"
                placeholder="Short Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm mb-1">Upload Image (3 Required)</label>
              <div className="flex flex-col items-center gap-2">
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  className="my-2 p-3 w-full border-2 rounded-lg font-normal text-sm"
                  onChange={handleImageChange}
                />
                <div className="flex flex-row gap-4 mt-2">
                  {images.length > 0 &&
                    images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Uploaded ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNewEvent}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Create Event
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Events;