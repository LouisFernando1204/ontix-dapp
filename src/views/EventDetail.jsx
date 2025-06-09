import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/ui/loading-screen";
import { getAllEvents } from "../servers/event";
import { getEventDetail, getEventProceeds, withdrawEventProceeds } from "../services/event";
import { errorMessage, formatEventDuration, formatFullDateTime, normalModal, successModal } from "../utils/helper";
import { useSearchParams } from "react-router-dom";
import { buyTickets } from "../services/ticket";
import { createHistory, deleteHistory } from "../servers/history";
import { deleteResale, getAllResales } from "../servers/resale";
import { buyResaleTickets, getResalePrice, getResaleSeller } from "../services/resale";

const EventDetail = ({ walletProvider, connectedAddress }) => {
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTicketOfficialAvailable, setIsTicketOfficialAvailable] = useState(true);
  const [isTicketResellerAvailable, setIsTicketResellerAvailable] = useState(true);
  const [eventProceeds, setEventProceeds] = useState(0);
  const [updateView, setUpdateView] = useState(false);

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()

  const eventBy = searchParams.get("by");

  useEffect(() => {
    if (eventBy == "official") {
      checkTicketOfficialAvailability();
      fetchEventOfficial();
    } else if (eventBy == "reseller") {
      checkTicketResellerAvailability();
      fetchEventReseller();
    } else {
      fetchEventProceeds();
      fetchEventOfficial();
    }
  }, [id, updateView, eventProceeds]);

  const errorScenario = (errorMsg = "Unexpected Error. Please try again later!") => {
    setIsLoading(false);
    if (!isLoading) {
      setTimeout(() => {
        normalModal("error", "Oops...", errorMsg);
      }, 1000);
    }
  };

  const fetchEventOfficial = async () => {
    setIsLoading(true);
    try {
      const allEvents = await getAllEvents();
      if (allEvents) {
        const filteredEvent = allEvents.data.find((event) =>
          event._id == id
        );
        const data = await getEventDetail(filteredEvent._id);
        const event = {
          id: filteredEvent._id,
          name: filteredEvent.name,
          location: filteredEvent.location,
          description: filteredEvent.description,
          images: filteredEvent.image,
          startTime: data.startTime,
          endTime: data.endTime,
          ticketPrice: data.ticketPrice,
          maxTickets: data.maxTickets,
          resaleStart: data.resaleStart,
          resaleEnd: data.resaleEnd,
          resalePriceCap: data.resalePriceCap,
          availableTicket: data.maxTickets - data.ticketsSold,
          creator: data.creator,
          ticketsSold: data.ticketsSold
        };
        setEvent(event);
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

  const fetchEventReseller = async () => {
    setIsLoading(true);
    try {
      const allEvents = await getAllResales();
      if (allEvents) {
        const filteredEvent = allEvents.data.data.find((event) =>
          event.idTicket.toLowerCase() == id.toLowerCase()
        );
        console.log("filteredEvent:", filteredEvent);
        const data = await getEventDetail(filteredEvent.idEvent);
        const resalePrice = await getResalePrice(filteredEvent.idTicket);
        const resaleSeller = await getResaleSeller(filteredEvent.idTicket);
        const event = {
          id: filteredEvent.event.id,
          name: filteredEvent.event.name,
          location: filteredEvent.event.location,
          description: filteredEvent.event.description,
          images: filteredEvent.event.image,
          startTime: data.startTime,
          endTime: data.endTime,
          ticketPrice: resalePrice,
          maxTickets: data.maxTickets,
          resaleStart: data.resaleStart,
          resaleEnd: data.resaleEnd,
          creator: resaleSeller,
          ticketsSold: data.ticketsSold
        };
        setEvent(event);
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

  const handleQtyChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleBuyTicket = async () => {
    setIsLoading(true);
    let historyResponses = [];
    if (!connectedAddress) {
      return errorScenario("Please connect to your wallet first.");
    }
    try {
      if (event.creator.toLowerCase() == connectedAddress.toLowerCase()) {
        return errorScenario("You can't buy your own ticket again.");
      }
      const tx = await buyTickets(id, quantity, walletProvider);
      const ticketIds = tx.data.event.ticketIds;
      const buyer = tx.data.event.buyer;
      for (const ticketId of ticketIds) {
        const res = await createHistory(id, ticketId.toString(), buyer);
        historyResponses.push(res);
      }
      const eventArgsArray = ticketIds.map((ticketId) => ({
        ticketId,
        buyer
      }));
      setTimeout(() => {
        successModal("Ticket Purchased Successfully!", tx.data.hash, eventArgsArray);
        navigate(`/transaction-history`);
      }, 1000);
    } catch (error) {
      console.error(error);
      let errorMsg = "An unexpected error occurred.";
      for (const history of historyResponses) {
        await deleteHistory(history.data.data._id);
      }
      if (error.response?.data?.message) {
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

  const handleBuyResaleTicket = async () => {
    setIsLoading(true);
    let historyResponses = [];
    if (!connectedAddress) {
      return errorScenario("Please connect to your wallet first.");
    }
    try {
      const res = await getAllResales();
      const filtered = res.data.data.find((event) =>
        event.idTicket.toLowerCase() == id.toLowerCase()
      );
      console.log("filtered:", filtered);
      const resaleSeller = await getResaleSeller(filtered.idTicket);
      if (resaleSeller.toLowerCase() == connectedAddress.toLowerCase()) {
        return errorScenario("You can't buy your own ticket again.");
      }
      const resalePrice = await getResalePrice(filtered.idTicket);
      console.log("resalePrice:", resalePrice);
      const tx = await buyResaleTickets([filtered.idTicket], resalePrice, walletProvider);
      const ticketIds = tx.data.event.ticketIds;
      const fromAddress = tx.data.event.fromAddress;
      const toAddress = tx.data.event.toAddress;
      for (const ticketId of ticketIds) {
        const res = await createHistory(filtered.idEvent, ticketId.toString(), toAddress);
        console.log("idEvent:", filtered.idEvent);
        console.log("ticketId:", ticketId);
        console.log("toAddress:", toAddress);
        historyResponses.push(res);
      }
      await deleteResale(filtered._id);
      const eventArgsArray = ticketIds.map((ticketId) => ({
        ticketId,
        fromAddress,
        toAddress
      }));
      setTimeout(() => {
        successModal("Ticket Resold Successfully!", tx.data.hash, eventArgsArray);
        navigate(`/transaction-history`);
      }, 1000);
    } catch (error) {
      console.error(error);
      let errorMsg = "An unexpected error occurred.";
      for (const history of historyResponses) {
        await deleteHistory(history.data.data._id);
      }
      if (error.response?.data?.message) {
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

  const checkTicketOfficialAvailability = async () => {
    setIsLoading(true);
    try {
      const event = await getEventDetail(id);
      if (event) {
        if (event.ticketsSold == event.maxTickets) {
          setIsTicketOfficialAvailable(false);
        }
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.reason) {
        return errorScenario(errorMessage(error));
      } else {
        return errorScenario(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkTicketResellerAvailability = async () => {
    setIsLoading(true);
    try {
      const resalePrice = await getResalePrice(id);
      console.log("resalePrice availability:", resalePrice);
      if (resalePrice) {
        if (resalePrice <= 0) {
          setIsTicketResellerAvailable(false);
        }
      }
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.reason) {
        return errorScenario(errorMessage(error));
      } else {
        return errorScenario(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawEventProceeds = async () => {
    setIsLoading(true);
    if (!connectedAddress) {
      return errorScenario("Please connect to your wallet first.");
    }
    try {
      const tx = await withdrawEventProceeds(id, walletProvider);
      const eventId = tx.data.event.eventId;
      const creator = tx.data.event.creator;
      const amount = tx.data.event.amount;
      setUpdateView(prev => !prev);
      setTimeout(() => {
        successModal("Event Proceeds Withdrawn Successfully!", tx.data.hash, [
          {
            eventId: eventId,
            creator: creator,
            amount: amount
          }
        ]);
      }, 1000);
    } catch (error) {
      console.error(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.reason) {
        return errorScenario(errorMessage(error));
      } else {
        return errorScenario(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventProceeds = async () => {
    setIsLoading(true);
    try {
      const proceeds = await getEventProceeds(id);
      setEventProceeds(proceeds);
    } catch (error) {
      console.error(error);
      let errorMsg = "An unexpected error occurred.";
      if (error.reason) {
        return errorScenario(errorMessage(error));
      } else {
        return errorScenario(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !event) return <LoadingScreen />;

  return (
    <div className="px-12 py-16 w-full bg-secondary flex flex-col grow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column: Carousel view */}
        <div className="w-full">
          <img
            src={event.images[selectedImage]}
            alt={event.name}
            className="rounded-lg shadow-md w-full h-64 object-cover mb-4"
          />
          <div className="flex space-x-2 overflow-x-auto">
            {event.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${selectedImage === idx ? "border-pink-600" : "border-transparent"}`}
              />
            ))}
          </div>
        </div>

        {/* Middle column: Event details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-darkOrange">{event.name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <span className="font-semibold">{event.ticketPrice} ETH</span>
            <span>•</span>
            <span>{event.location}</span>
          </div>
          <p className="text-sm text-gray-500">
            Held On: {formatEventDuration(event.startTime, event.endTime)}
          </p>
          {eventBy == "official" || eventBy == "connectedAddress" && (
            <p className="text-sm text-gray-500">Resale Ends: {formatFullDateTime(event.resaleEnd)}</p>
          )}
          <p className="text-sm text-gray-500">Created By: {event.creator}</p>
          {
            eventBy == "official" || eventBy == "connectedAddress" ? (
              <p className="text-sm text-gray-500">Resale Price Cap: {event.resalePriceCap} ETH</p>
            ) : null
          }
          {eventBy == "official" || eventBy == "connectedAddress" ? (
            <p className="text-sm text-gray-500">Available Ticket: {event.availableTicket}</p>
          ) :
            null}
          <p className="text-sm text-gray-500">
            {eventBy == "reseller" ? (
              <>Resale by: <span className="italic">{event.creator}</span></>
            ) : (
              <>By: <span className="font-semibold">{event.creator}</span></>
            )}
          </p>
          <p className="text-gray-800">{event.description}</p>
        </div>

        {/* Right column: Purchase panel */}
        <div className="flex flex-col space-y-4">
          <div className="h-fit bg-white rounded-lg shadow-lg p-6 space-y-4 border border-gray-200">
            {
              eventBy == "connectedAddress" ? (
                <div className="text-lg font-medium text-gray-700">
                  Available Earnings to Withdraw:
                  <span className="text-pink-600 font-bold ml-2">{eventProceeds ?? "0.05"} ETH</span>
                </div>
              ) : (
                <div className="text-lg font-medium text-gray-700">
                  Price per ticket:
                  <span className="text-pink-600 font-bold ml-2">{event.ticketPrice ?? "0.05"} ETH</span>
                </div>
              )
            }
            {
              eventBy === "connectedAddress" ? (
                <button
                  disabled={eventProceeds <= 0}
                  onClick={() => handleWithdrawEventProceeds()}
                  className={`w-full transition text-white font-semibold py-3 rounded-lg ${eventProceeds <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
                    }`}
                >
                  {eventProceeds <= 0
                    ? "You’ve already withdrawn all earnings for this event."
                    : "Withdraw My Event"}
                </button>
              ) : eventBy === "official" ? (
                <>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={quantity}
                      className="w-16 text-center border rounded-lg px-2 py-1"
                    />
                    <button
                      onClick={() => handleQtyChange(1)}
                      className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </>
              ) : null
            }
            {
              eventBy !== "connectedAddress" && (
                eventBy === "official" ? (
                  !isTicketOfficialAvailable ? (
                    <button
                      disabled
                      onClick={() => handleBuyTicket()}
                      className="w-full bg-slate-300 transition text-white font-semibold py-3 rounded-lg"
                    >
                      SOLD OUT
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyTicket()}
                      className="w-full bg-pink-600 hover:bg-pink-700 transition text-white font-semibold py-3 rounded-lg"
                    >
                      Buy Now
                    </button>
                  )
                ) : eventBy === "reseller" ? (
                  !isTicketResellerAvailable ? (
                    <button
                      disabled
                      onClick={() => handleBuyResaleTicket()}
                      className="w-full bg-slate-300 transition text-white font-semibold py-3 rounded-lg"
                    >
                      SOLD OUT
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyResaleTicket()}
                      className="w-full bg-pink-600 hover:bg-pink-700 transition text-white font-semibold py-3 rounded-lg"
                    >
                      Buy Now
                    </button>
                  )
                ) : null
              )
            }
          </div>
        </div>
      </div>
    </div >
  );
};

export default EventDetail;