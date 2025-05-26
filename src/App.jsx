/* eslint-disable no-unused-vars */
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { holesky } from "@reown/appkit/networks";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/fixed/Layout"
import Home from "./views/Home"
import Events from "./views/Events";
import EventDetail from "./views/EventDetail";
import Verfication from "./views/Verfication";
import History from "./views/History";
import Missing from "./views/Missing";

const projectId = import.meta.env.VITE_PROJECT_ID;

const networks = [holesky];

const metadata = {
  name: "OnTix",
  description:
    "OnTix is a decentralized NFT ticketing platform built on the Ethereum blockchain, designed to eliminate ticket fraud, scalping, and centralization in event ticket sales. It empowers event organizers and attendees through secure, transparent, and tradable digital tickets.",
  url: "http://localhost:5173",
  icons: ["https://i.postimg.cc/9MFmqwpV/Chat-GPT-Image-May-26-2025-09-13-48-AM.png"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
});

const App = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  return (
    <Routes>
      <Route
        path="/"
        element={<Layout handleConnect={open} connectedAddress={address} />}
      >
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/ticket-verification" element={<Verfication />} />
        <Route path="/transaction-history" element={<History />} />
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  )
}

export default App