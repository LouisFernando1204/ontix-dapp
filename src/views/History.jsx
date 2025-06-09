/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";
import Swal from "sweetalert2";
import { getAllHistories } from "../servers/history";
import { getEventDetail } from "../services/event";
import { errorMessage, formatEventDuration, formatFullDateTime, normalModal, successModal } from "../utils/helper";
import { getResalePrice, getResaleSeller, listForResale } from "../services/resale";
import { createResale, deleteResale } from "../servers/resale";
import { getOwnerOfTicket, transferTickets } from "../services/ticket";
import { getTicketMetadata, getTokenURI } from "../services/ticketMetadata";

const History = ({ walletProvider, connectedAddress }) => {
    const [purchasedTickets, setPurchasedTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updateHistory, setUpdateHistory] = useState(false);

    useEffect(() => {
        if (connectedAddress) {
            fetchPurchaseHistory();
        }
    }, [updateHistory, connectedAddress]);

    const errorScenario = (errorMsg = "Unexpected Error. Please try again later!") => {
        setIsLoading(false);
        if (!isLoading) {
            setTimeout(() => {
                normalModal("error", "Oops...", errorMsg);
            }, 1000);
        }
    };

    const fetchPurchaseHistory = async () => {
        setIsLoading(true);
        try {
            const res = await getAllHistories();
            const filtered = res.data.data.filter(
                (history) => history.account.toLowerCase() === connectedAddress.toLowerCase()
            );
            console.log("filtered:", filtered);
            if (filtered) {
                const allTickets = await Promise.all(
                    filtered.map(async (ticket, _) => {
                        const data = await getEventDetail(ticket.idEvent);
                        const ticketResoldStatus = await checkTicketResoldStatus(ticket.idTicket);
                        console.log(`ticketResoldStatus ${ticket.idTicket}:`, ticketResoldStatus);
                        const ticketTransferredStatus = await checkTicketTransferredStatus(ticket.idTicket);
                        console.log(`ticketTransferredStatus ${ticket.idTicket}:`, ticketTransferredStatus);
                        const ticketValidatedStatus = await checkTicketValidatedStatus(ticket.idTicket);
                        console.log(`ticketValidatedStatus ${ticket.idTicket}:`, ticketValidatedStatus);
                        return {
                            ticketId: ticket.idTicket,
                            eventId: ticket.event._id,
                            name: ticket.event.name,
                            location: ticket.event.location,
                            description: ticket.event.description,
                            images: ticket.event.image,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            ticketPrice: data.ticketPrice,
                            maxTickets: data.maxTickets,
                            resaleStart: data.resaleStart,
                            resaleEnd: data.resaleEnd,
                            resalePriceCap: data.resalePriceCap,
                            creator: data.creator,
                            ticketsSold: data.ticketsSold,
                            resoldStatus: ticketResoldStatus,
                            transferredStatus: ticketTransferredStatus,
                            validatedStatus: ticketValidatedStatus
                        };
                    })
                );
                setPurchasedTickets(allTickets);
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

    const showPopUpResellTicket = async (ticketId, eventId) => {
        const { value: ticketPrice } = await Swal.fire({
            title: "Resell Ticket",
            text: "How much would you like to charge for this ticket?",
            input: "text",
            inputLabel: "Ticket Price (ETH)",
            inputPlaceholder: "0.00001",
            showCancelButton: true,
            confirmButtonText: "Yes, resell it!",
            cancelButtonText: "No, cancel",
            customClass: {
                confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
                cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2',
            },
            buttonsStyling: false,
        });
        if (ticketPrice) {
            handleResellTicket(eventId, ticketId, ticketPrice, walletProvider);
        }
    };

    const handleResellTicket = async (idEvent, idTicket, price, walletProvider) => {
        setIsLoading(true);
        let res;
        try {
            res = await createResale(idEvent, idTicket);
            const tx = await listForResale(idTicket, price, walletProvider);
            const ticketId = tx.data.event.ticketId;
            const ticketPrice = tx.data.event.ticketPrice;
            setUpdateHistory(true);
            setTimeout(() => {
                successModal("Ticket Listed For Resale Successfully!", tx.data.hash, [
                    {
                        ticketId: ticketId,
                        ticketPrice: ticketPrice
                    }
                ]);
            }, 1000);
        } catch (error) {
            console.error(error);
            let errorMsg = "An unexpected error occurred.";
            await deleteResale(res.data.data._id);
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

    const checkTicketResoldStatus = async (ticketId) => {
        try {
            const resalePrice = await getResalePrice(ticketId);
            if (resalePrice) {
                if (resalePrice <= 0) {
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.log(error);
            let errorMsg = "An unexpected error occurred.";
            if (error.reason) {
                return errorScenario(errorMessage(error));
            } else {
                return errorScenario(errorMsg);
            }
        }
    };

    const showPopUpTransferTicket = async (ticketIds) => {
        const { value: toAddress } = await Swal.fire({
            title: "Transfer Ticket",
            input: "text",
            inputLabel: "Recipient Address",
            inputPlaceholder: "0x...",
            showCancelButton: true,
            customClass: {
                confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
                cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2',
            },
            buttonsStyling: false,
        });
        if (toAddress) {
            console.log("ticketIds:", ticketIds);
            handleTransferTicket(toAddress, ticketIds, walletProvider);
        }
    };

    const handleTransferTicket = async (toAddress, idTickets, walletProvider) => {
        setIsLoading(true);
        try {
            console.log("toAddress:", toAddress);
            console.log("idTickets:", idTickets);
            console.log("walletProvider:", walletProvider);
            const tx = await transferTickets(toAddress, idTickets, walletProvider);
            const ticketIds = tx.data.event.ticketIds;
            const from = tx.data.event.fromAddress;
            const to = tx.data.event.toAddress;
            const eventArgsArray = ticketIds.map((ticketId) => ({
                ticketId,
                from,
                to
            }));
            setUpdateHistory(true);
            setTimeout(() => {
                successModal("Ticket Transferred Successfully!", tx.data.hash, eventArgsArray);
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

    const checkTicketTransferredStatus = async (ticketId) => {
        try {
            const owner = await getOwnerOfTicket(ticketId);
            if (owner) {
                if (owner.toLowerCase() != connectedAddress.toLowerCase()) {
                    console.log("owner:", owner);
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.log(error);
            let errorMsg = "An unexpected error occurred.";
            if (error.reason) {
                return errorScenario(errorMessage(error));
            } else {
                return errorScenario(errorMsg);
            }
        }
    };

    const checkTicketValidatedStatus = async (ticketId) => {
        try {
            const ticketValidated = await getTicketMetadata(ticketId);
            if (ticketValidated) {
                if (ticketValidated.isUsed) {
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.log(error);
            let errorMsg = "An unexpected error occurred.";
            if (error.reason) {
                return errorScenario(errorMessage(error));
            } else {
                return errorScenario(errorMsg);
            }
        }
    };

    const showPopUpNFTQR = async (ticketId) => {
        const qrURI = await getTokenURI(ticketId);
        console.log("qrURI:", qrURI);
        const response = await fetch(qrURI);
        const metadata = await response.json();
        const qrImageURL = metadata.image;
        console.log("QR Image URL:", qrImageURL);
        if (qrImageURL) {
            Swal.fire({
                title: `Ticket #${ticketId}`,
                html: `<img src="${qrImageURL}" alt="QR Code - ${ticketId}" class="w-full h-auto mx-auto" />`,
                showCloseButton: true,
                confirmButtonText: "Close",
                customClass: {
                    confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
                },
                buttonsStyling: false,
            });
        }
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="flex flex-col items-start px-12 py-16 w-full relative">
            <h1 className="text-3xl font-semibold text-darkOrange mb-8">Your Purchased Tickets</h1>
            {purchasedTickets.length === 0 ? (
                <EmptyPage text="You have not purchased any tickets yet." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {purchasedTickets.map((ticket, index) => (
                        <motion.div
                            key={`${ticket.id}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer relative"
                        >
                            <img
                                src={ticket.images[0]}
                                alt={ticket.name}
                                className="w-full h-72 object-cover cursor-pointer"
                                onClick={
                                    (!ticket.validatedStatus && (!ticket.resoldStatus || !ticket.transferredStatus))
                                        ? () => showPopUpNFTQR(ticket.ticketId)
                                        : null
                                }
                            />
                            <div className="p-4">
                                <div className="flex items-center text-white mb-1 space-x-2">
                                    <h3 className="text-xl font-bold text-pink-600 mb-1">{ticket.name}</h3>
                                    <span>•</span>
                                    <h3 className="text-xl font-bold text-pink-600 mb-1">Ticket #{ticket.ticketId}</h3>
                                </div>
                                <div className="flex items-center text-white mb-1 space-x-2">
                                    <span>{ticket.resalePriceCap} ETH</span>
                                    <span>•</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.validatedStatus ? "bg-green-600" : "bg-yellow-500"}`}>
                                        {ticket.validatedStatus ? "Validated" : "Not Validated"}
                                    </span>
                                </div>
                                <p className="text-sm text-white line-clamp-3">At: {ticket.location}</p>
                                <p className="text-sm text-white line-clamp-3">Held On: {formatEventDuration(ticket.startTime, ticket.endTime)}</p>
                                <p className="text-sm text-white line-clamp-3 mb-2">Resale On: {formatFullDateTime(ticket.resaleStart)} - {formatFullDateTime(ticket.resaleEnd)}</p>
                                <p className="text-sm text-gray-300 italic mb-2">Event By: {ticket.creator}</p>
                                <div className="flex gap-2">
                                    {
                                        ticket.resoldStatus || ticket.transferredStatus || ticket.validatedStatus ? (
                                            <button
                                                disabled
                                                onClick={() => {
                                                    showPopUpResellTicket(ticket.ticketId, ticket.eventId);
                                                }}
                                                className="bg-slate-300 text-white px-3 py-1 rounded"
                                            >
                                                Resell
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    showPopUpResellTicket(ticket.ticketId, ticket.eventId);
                                                }}
                                                className="bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700"
                                            >
                                                Resell
                                            </button>
                                        )
                                    }
                                    {
                                        ticket.transferredStatus || ticket.resoldStatus || ticket.validatedStatus ? (
                                            <button
                                                disabled
                                                onClick={() => {
                                                    showPopUpTransferTicket([ticket.ticketId]);
                                                }}
                                                className="bg-slate-300 text-white px-3 py-1 rounded"
                                            >
                                                Transfer
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    showPopUpTransferTicket([ticket.ticketId]);
                                                }}
                                                className="bg-pink-400 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                                            >
                                                Transfer
                                            </button>
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;