import React from "react";
import { navList } from "../../utils/list";
import { Link, useLocation } from "react-router-dom";
import { truncate } from "../../utils/helper";
import OnTixLogo from "../../assets/OnTixLogo_ori.png";
import MetaMaskWalletLogo from "../../assets/MetaMaskWalletLogo.svg";

const Navbar = ({ connectedAddress, handleConnect }) => {
  const location = useLocation();

  return (
    <div className="w-full text-white shadow-lg">
      <nav className="bg-pink-100 w-full border-b border-pink-700">
        <div className="max-w-screen-xl flex items-center justify-around mx-auto px-6 py-6 md:py-4">
          <a href="/" className="flex items-center space-x-3">
            <img src={OnTixLogo} alt="logo" className="w-20" />
          </a>

          {/* Navigation Tabs */}
          <div className="hidden md:flex justify-center space-x-8 mx-auto">
            {navList.map((item, index) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  to={item.url}
                  key={index}
                  className={`py-2 px-4 font-medium rounded transition duration-200
                    ${isActive
                      ? "bg-pink-700 text-white"
                      : "text-black hover:bg-pink-700 hover:text-white"}`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Connect Wallet */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                handleConnect();
              }}
              className="relative bg-slate-950 p-3 md:p-3.5 rounded-xl hover:scale-105 duration-200 flex items-center gap-2 shadow-md"
            >
              <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-700 opacity-75"></span>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-700"></span>
              <img src={MetaMaskWalletLogo} alt="plug" className="h-8" />
              <h1 className="text-gray-300 font-semibold">
                {connectedAddress ? truncate(connectedAddress, 4, 4, 12) : "Connect Wallet"}
              </h1>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;