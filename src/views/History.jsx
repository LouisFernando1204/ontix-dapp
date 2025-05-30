import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "../components/ui/loading-screen";
import EmptyPage from "../views/EmptyPage";
import Swal from "sweetalert2";
import QRCode from "../assets/dummy_qr.png";

const History = () => {
    const [purchasedTickets, setPurchasedTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchPurchaseHistory = async () => {
        setLoading(true);
        try {
            const history = [
                {
                    idEvent: "9001",
                    name: "EDC Las Vegas 2024",
                    location: "Las Vegas Motor Speedway",
                    description: "Experience the ultimate EDM festival under the electric sky.",
                    image: ["https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg"],
                    resellerName: null,
                    validated: true,
                },
                {
                    idEvent: "9002",
                    name: "Glastonbury Rewind",
                    location: "Worthy Farm, UK",
                    description: "A historic celebration of Glastonbury legends and moments.",
                    image: ["https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg"],
                    resellerName: "TicketGuy42",
                    validated: false,
                },
            ];
            setPurchasedTickets(history);
        } catch (error) {
            console.error("Failed to load ticket history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResell = () => {
        Swal.fire({
            title: "Resell Ticket?",
            text: "Are you sure you want to resell this ticket?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, resell it!",
            cancelButtonText: "No, cancel",
            customClass: {
                confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
                cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2',
            },
            buttonsStyling: false,
        });
    };

    const handleTransfer = async () => {
        const { value: address } = await Swal.fire({
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

        if (address) {
            Swal.fire(`Ticket transferred to: ${address}`);
        }
    };

    const openTicketModal = (ticket) => {
        setSelectedTicket(ticket);
        Swal.fire({
            title: ticket.name,
            html: `<img src="${QRCode}" alt="QR Code" class="w-full h-auto mx-auto" />`,
            showCloseButton: true,
            confirmButtonText: "Close",
            customClass: {
                confirmButton: 'bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700',
            },
            buttonsStyling: false,
        });
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, []);

    if (loading) return <LoadingScreen />;
    if (purchasedTickets.length === 0)
        return <EmptyPage text="You have not purchased any tickets yet." />;

    return (
        <div className="flex flex-col items-start px-12 py-16 w-full relative">
            <h1 className="text-3xl font-semibold text-darkOrange mb-8">Your Purchased Tickets</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {purchasedTickets.map((ticket, index) => (
                    <motion.div
                        key={`${ticket.idEvent}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-black rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer relative"
                    >
                        <img
                            src={ticket.image[0]}
                            alt={ticket.name}
                            className="w-full h-72 object-cover"
                            onClick={() => openTicketModal(ticket)}
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-pink-600 mb-1">{ticket.name}</h3>
                            <div className="flex items-center text-white mb-1 space-x-2">
                                <span>{ticket.location}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.validated ? "bg-green-600" : "bg-yellow-500"}`}>
                                    {ticket.validated ? "Validated" : "Not Validated"}
                                </span>
                            </div>
                            <p className="text-sm text-white line-clamp-3 mb-2">{ticket.description}</p>
                            {ticket.resellerName && <p className="text-sm text-gray-300 italic mb-2">By: {ticket.resellerName}</p>}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleResell}
                                    className="bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700"
                                >
                                    Resell
                                </button>
                                <button
                                    onClick={handleTransfer}
                                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                                >
                                    Transfer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default History;
