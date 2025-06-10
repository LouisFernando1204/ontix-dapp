/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Ticket,
  MapPinned,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";
import { validateTicket } from "../services/ticket";
import { errorMessage, formatEventDuration, normalModal, successModal } from "../utils/helper";
import { getAllEvents } from "../servers/event";
import { getEventDetail } from "../services/event";
import LoadingScreen from "../components/ui/loading-screen";
import { getTicketMetadata } from "../services/ticketMetadata";

const qrCodeRegionId = "qr-reader";

const Verification = ({ walletProvider, connectedAddress }) => {
  const html5QrCodeRef = useRef(null);
  const beepSoundRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [checkinTime, setCheckinTime] = useState(null);

  const waitForQrElement = (isMounted) => {
    const qrElement = document.getElementById(qrCodeRegionId);
    if (!qrElement) {
      setTimeout(waitForQrElement, 100);
      return;
    }
    navigator.permissions
      .query({ name: "camera" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
          Html5Qrcode.getCameras()
            .then((devices) => {
              if (isMounted && devices && devices.length) {
                setCameras(devices);
                const cameraId = devices[0].id;
                html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
                html5QrCodeRef.current
                  .start(
                    cameraId,
                    { fps: 10, qrbox: 250 },
                    async (decodedText) => {
                      if (scanHistory.includes(decodedText) || !connectedAddress) {
                        beepSoundRef.current?.play()
                          .then(() => console.log("Beep played"))
                          .catch(err => console.warn("Error playing beep:", err));
                        setCheckinStatus("error");
                        setEventData(null);
                        setScanResult(decodedText);
                        return;
                      }
                      await beepSoundRef.current?.play()
                        .then(() => console.log("Beep played"))
                        .catch(err => console.warn("Error playing beep:", err));
                      const regex = /#(\d+)/;
                      const match = decodedText.match(regex);
                      if (!match) {
                        setCheckinStatus("error");
                        return;
                      }
                      const ticketId = match[1];
                      setScanResult(ticketId);
                      setScanHistory((prev) => [...prev, decodedText]);
                      try {
                        const statusValidated = await handleValidateTicket(ticketId);
                        if (statusValidated) {
                          const eventDetail = await fetchEvent(ticketId);
                          setEventData(eventDetail);
                          setCheckinStatus("success");
                          setCheckinTime(new Date().toLocaleTimeString());
                        }
                      } catch (error) {
                        setCheckinStatus("error");
                        console.error("Error verifying ticket:", error);
                      }
                    },
                    () => { }
                  )
                  .then(() => setIsScanning(true))
                  .catch((err) => {
                    console.warn("Gagal memulai scanning:", err);
                    setIsScanning(false);
                  });
              } else {
                console.warn("No camera devices found.");
                setIsScanning(false);
              }
            })
            .catch((err) => {
              console.warn("Gagal mendapatkan kamera:", err);
              setIsScanning(false);
            });
        } else {
          console.warn("Akses kamera diblokir. Mohon aktifkan kamera di pengaturan browser.");
          setIsScanning(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memeriksa permission kamera:", err);
        setIsScanning(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    waitForQrElement(isMounted);
    return () => {
      isMounted = false;
      try {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current
            .stop()
            ?.then(() => html5QrCodeRef.current.clear())
            .catch(() => { });
        }
      } catch (err) {
        console.warn("QR cleanup error:", err);
      }
    };
  }, [scanHistory, connectedAddress]);

  const errorScenario = (errorMsg = "Unexpected Error. Please try again later!") => {
    setIsLoading(false);
    if (!isLoading) {
      setTimeout(() => {
        normalModal("error", "Oops...", errorMsg);
      }, 1000);
    }
  };

  const handleValidateTicket = async (idTicket) => {
    setIsLoading(true);
    try {
      const tx = await validateTicket(idTicket, walletProvider);
      const ticketId = tx.data.event.ticketId;
      setTimeout(() => {
        successModal("Ticket Validated Successfully!", tx.data.hash, [
          {
            ticketId: ticketId
          }
        ]);
      }, 1000);
      return true;
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

  const fetchEvent = async (idTicket) => {
    setIsLoading(true);
    try {
      const allEvents = await getAllEvents();
      if (allEvents) {
        console.log("idTicket:", idTicket);
        const ticket = await getTicketMetadata(idTicket);
        const eventId = ticket.eventId;
        console.log("eventId:", eventId);
        const filteredEvent = allEvents.data.find((event) =>
          event._id == eventId
        );
        console.log("filteredEvent:", filteredEvent);
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
          creator: data.creator,
          ticketsSold: data.ticketsSold
        };
        return event;
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

  const handleResetScanner = () => {
    setEventData(null);
    setCheckinStatus(null);
    setCheckinTime(null);
    setScanResult(null);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-start px-12 py-16 w-full relative bg-gradient-to-br from-pink-50 to-purple-50 gap-6">
      <audio ref={beepSoundRef} src="audio/beeb.mp3" preload="auto" />
      <div className="flex-1 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Event Check-in Verification
          </h1>
          <p className="text-gray-600">
            Scan QR code untuk melakukan check-in ke event
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 min-h-[480px]">
          <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col justify-start items-center">
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Check-in Information
                </h2>
                <p className="text-gray-600">Event Detail & Check-in Status</p>
              </div>

              {checkinStatus === "success" && eventData && checkinTime && scanResult ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="text-green-500" size={24} />
                      <h3 className="text-lg font-semibold text-green-800">
                        Check-in Successfully!
                      </h3>
                    </div>
                    <p className="text-green-700">
                      You have successfully checked in to the event.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Hash className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Ticket ID</p>
                        <p className="text-lg text-gray-800">{scanResult}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Ticket className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Event Name:</p>
                        <p className="text-lg text-gray-800">{eventData.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPinned className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Event Location:</p>
                        <p className="text-lg text-gray-800">{eventData.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Event Time:</p>
                        <p className="text-lg text-gray-800">{formatEventDuration(eventData.startTime, eventData.endTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Event Creator:</p>
                        <p className="text-lg text-gray-800">{eventData.creator}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Waktu Check-in</p>
                        <p className="text-lg text-gray-800">{checkinTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : checkinStatus === "error" ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <AlertCircle className="text-red-500" size={36} />
                  </div>
                  <h3 className="text-xl font-semibold text-red-700 mb-2">
                    Check-in Failed!
                  </h3>
                  <p className="text-red-600 mb-4">
                    {!connectedAddress ? "Please connect to your wallet first." : "This QR Code has already been used for check-in."}
                  </p>
                </div>
              ) : (
                <div className="text-center py-40 text-gray-400">
                  <p>Scan QR code untuk menampilkan informasi event</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-start items-center space-x-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Ticket QR Scanner
              </h2>
              <p className="text-gray-600">
                Turn on the camera and point it at the QR code.
              </p>
            </div>
            <div id={qrCodeRegionId} style={{ width: "100%" }} />
            <div className="mt-4 flex justify-center items-center text-center">
              <div
                className={`inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg ${isScanning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isScanning ? "bg-green-500" : "bg-gray-400"
                    }`}
                />
                {isScanning ? "Camera is now Active" : "Kamera is not Active"}
              </div>
            </div>
          </div>
        </div>
        {(checkinStatus === "success" || checkinStatus === "error") && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => handleResetScanner()}
              className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-semibold transition"
            >
              Scan Next Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;