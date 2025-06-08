import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoadingScreen from "../ui/loading-screen";
import { BackgroundBeamsWithCollision } from "../ui/background-beams-with-collision";

const Layout = ({ handleConnect, connectedAddress }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar handleConnect={handleConnect} connectedAddress={connectedAddress} />

      <main className="flex-grow">
        <BackgroundBeamsWithCollision className="h-full w-full flex flex-col items-center justify-center font-poppins">
          <Outlet />
        </BackgroundBeamsWithCollision>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;