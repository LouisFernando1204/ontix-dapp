import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/ui/loading-screen";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null); // Holds event data
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [quantity, setQuantity] = useState(1); // Tracks ticket quantity
  const [selectedImage, setSelectedImage] = useState(0); // Selected image index for carousel

  // Simulates fetching event data by ID
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          idEvent: "1230",
          name: "Tech Halo 2025",
          location: "Jakarta Convention Center",
          description: "A premier event showcasing the latest in tech innovation.",
          image: [
            "https://di1w2o32ai2v6.cloudfront.net/images/thumbnails/1920/1080/detailed/10/NULBARICH_CLOSEACHAPTER_169_A.jpg",
            "/public/images/home_3.jpg",
            "https://dynamicmedia.livenationinternational.com/Media/c/g/u/3afea2b8-76d6-4884-a2f4-1bcf58c53f60.jpg?format=webp&width=3840&quality=75"
          ],
          price: "0.08",
          reseller: null,
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

  const handleQtyChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleBuy = () => {
    alert(`Buying ${quantity} ticket(s) for ${event.name} at ${event.price} ETH each`);
  };

  if (loading || !event) return <LoadingScreen />;

  return (
    <div className="px-12 py-16 w-full bg-secondary flex flex-col grow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column: Carousel view */}
        <div className="w-full">
          <img
            src={event.image[selectedImage]}
            alt={`Event Main`}
            className="rounded-lg shadow-md w-full h-64 object-cover mb-4"
          />
          <div className="flex space-x-2 overflow-x-auto">
            {event.image.map((img, idx) => (
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
          <p className="text-sm text-gray-600">{event.location}</p>
          <p className="text-gray-800">{event.description}</p>
          <p className="text-sm text-gray-500">
            By: {event.reseller ? event.reseller : <span className="font-semibold">Official</span>}
          </p>
        </div>

        {/* Right column: Purchase panel */}
        <div className="h-52 bg-white rounded-lg shadow-lg p-6 space-y-4 border border-gray-200">
          <div className="text-lg font-medium text-gray-700">
            Price per ticket:
            <span className="text-pink-600 font-bold ml-2">{event.price ?? "0.05"} ETH</span>
          </div>
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
          <button
            onClick={handleBuy}
            className="w-full bg-pink-600 hover:bg-pink-700 transition text-white font-semibold py-3 rounded-lg"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
