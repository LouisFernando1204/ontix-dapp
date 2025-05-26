import React from "react";
import { navList } from "../../utils/list";
import { Link } from "react-router-dom";
import { truncate } from "../../utils/helper";
import OnTixLogo from "../../assets/OnTixLogo_ori.png";
import MetaMaskWalletLogo from "../../assets/MetaMaskWalletLogo.svg";

const Navbar = ({
    connectedAddress,
    handleConnect
}) => {
    return (
        <div className="w-full text-white shadow-lg">
            <nav className="bg-pink-100 w-full border-b border-pink-700">
                <div className="max-w-screen-xl flex items-center justify-between mx-auto px-6 py-6 md:py-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center space-x-3">
                        <img
                            src={OnTixLogo}
                            alt="logo"
                            className="w-20"
                        />
                    </a>
                    {/* Navigation Links (Centered) */}
                    <div className="hidden md:flex justify-center space-x-16 mx-auto">
                        {navList.map((item, index) => (
                            <Link
                                to={item.url}
                                key={index}
                                className="text-slate-900 hover:text-white hover:bg-pink-700 py-2 px-4 rounded transition duration-200"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>
                    {/* Connect Wallet / Principal Info */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => {
                                handleConnect();
                            }}
                            className="relative bg-slate-950 p-2 md:p-3.5 rounded-xl hover:scale-105 duration-200 flex items-center gap-2 shadow-md"
                        >
                            <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-700 opacity-75"></span>
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-700"></span>
                            <img src={MetaMaskWalletLogo} alt="plug" className="h-8" />
                            <h1 className="text-gray-300 font-semibold">
                                {
                                    connectedAddress ?
                                        truncate(connectedAddress, 4, 4, 12) :
                                        "Connect Wallet"
                                }
                            </h1>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;