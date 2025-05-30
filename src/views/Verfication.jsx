import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";

const qrCodeRegionId = "qr-reader";

const Verification = () => {
  const html5QrCodeRef = useRef(null);
  const beepSoundRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [scanHistory, setScanHistory] = useState([]); 
  const [checkinStatus, setCheckinStatus] = useState(null);

  const parseEventData = (qrData) => {
    try {
      const data = JSON.parse(qrData);
      return {
        eventId: data.eventId || "N/A",
        eventName: data.eventName || "Unknown Event",
        eventDate: data.eventDate || new Date().toISOString().split("T")[0],
        participantName: data.participantName || "Unknown Participant",
        checkinTime: data.checkinTime || new Date().toLocaleTimeString(),
      };
    } catch {
      return {
        eventId: "N/A",
        eventName: "Invalid QR Code",
        eventDate: new Date().toISOString().split("T")[0],
        participantName: "Unknown",
        checkinTime: new Date().toLocaleTimeString(),
      };
    }
  };

  useEffect(() => {
    let isMounted = true;

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
              (decodedText) => {
                if (scanHistory.includes(decodedText)) {
                  setCheckinStatus("error");
                  setEventData(null);
                  setScanResult(decodedText);
                  setShowPopup(true);
                } else {
                  setScanResult(decodedText);
                  const parsed = parseEventData(decodedText);
                  setEventData(parsed);
                  setCheckinStatus("success");
                  setScanHistory((prev) => [...prev, decodedText]);
                  if (beepSoundRef.current) beepSoundRef.current.play();
                  setShowPopup(true);
                }
              },
              () => {}
            )
            .then(() => setIsScanning(true))
            .catch((err) => console.error("Gagal memulai scanning:", err));
        }
      })
      .catch((err) => console.error("Error getting cameras:", err));

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current.clear().catch(() => {});
          });
      }
    };
  }, [scanHistory]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6 flex gap-6">
      <audio ref={beepSoundRef} src="/beep.mp3" preload="auto" />
      <div className="flex-1 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Event Check-in Verification
          </h1>
          <p className="text-gray-600">
            Scan QR code untuk melakukan check-in ke event
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[480px] flex flex-col justify-between">
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Informasi Check-in
                </h2>
                <p className="text-gray-600">Detail event dan status check-in</p>
              </div>

              {checkinStatus === "success" && eventData ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="text-green-500" size={24} />
                      <h3 className="text-lg font-semibold text-green-800">
                        Check-in Berhasil!
                      </h3>
                    </div>
                    <p className="text-green-700">
                      Anda telah berhasil melakukan check-in ke event.
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
                      <User className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Nama Event</p>
                        <p className="text-lg text-gray-800">{eventData.eventName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Tanggal Event</p>
                        <p className="text-lg text-gray-800">
                          {new Date(eventData.eventDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="text-gray-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Waktu Check-in</p>
                        <p className="text-lg text-gray-800">{eventData.checkinTime}</p>
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
                    Gagal Check-in!
                  </h3>
                  <p className="text-red-600 mb-4">
                    QR Code ini sudah pernah digunakan untuk check-in.
                  </p>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p>Scan QR code untuk menampilkan informasi event</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                QR Code Scanner
              </h2>
              <p className="text-gray-600">
                Aktifkan kamera dan arahkan ke QR code
              </p>
            </div>
            <div id={qrCodeRegionId} style={{ width: "100%" }} />
            <div className="mt-4 text-center">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isScanning ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isScanning ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {isScanning ? "Kamera Aktif" : "Kamera Tidak Aktif"}
              </div>
            </div>
          </div>
        </div>

        {showPopup && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs"
            onClick={() => setShowPopup(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {checkinStatus === "success" ? (
                <>
                  <CheckCircle
                    className="mx-auto mb-2 text-green-500"
                    size={48}
                  />
                  <h3 className="text-xl font-semibold mb-2">Scan Berhasil!</h3>
                  <p className="mb-4">Anda berhasil melakukan check-in ke event.</p>
                  <p className="mb-4">ID tiket Anda : {scanResult}</p>
                </>
              ) : (
                <>
                  <AlertCircle
                    className="mx-auto mb-2 text-red-500"
                    size={48}
                  />
                  <h3 className="text-xl font-semibold mb-2">Scan Gagal!</h3>
                  <p className="mb-4">QR Code ini sudah pernah digunakan.</p>
                </>
              )}

              <button
                onClick={() => setShowPopup(false)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
