import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import image1 from "/images/home_1.jpg";
import image2 from "/images/home_2.jpg";
import image3 from "/images/home_3.jpg";

const images = [image1, image2, image3];

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);

  const onTixBenefits = [
    {
      header: "Decentralized Ownership",
      description: "Your tickets are NFTs – own them, trade them, or store them securely.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      header: "No Middlemen",
      description: "No third-party fees. Buy and sell tickets peer-to-peer, instantly.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      header: "Built on Web3",
      description: "Utilizes blockchain and smart contracts for full transparency.",
      icon: () => <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="text-center p-8 text-gray-500">Loading OnTix...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <>
      <div className="font-lato h-screen w-full -mt-12 md:-mt-32">
        <div className="relative w-full overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-full flex-shrink-0 shadow-lg h-screen object-cover"
              />
            ))}
          </div>

          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-0"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-2xl md:text-3xl lg:text-5xl font-black text-center"
            >
              Revolutionizing Events with NFTs & Web3
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-md md:text-lg lg:text-xl px-12 lg:px-56 text-center"
            >
              OnTix is a blockchain-based ticketing platform where event organizers can issue tickets as NFTs — fully owned, tradable, and secure, without middlemen.
            </motion.h2>
          </motion.div>
        </div>
      </div>

      <section className="py-16 px-6 md:px-12 lg:px-20 bg-lightGray">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-3xl font-bold text-darkOrange text-center mb-8"
        >
          Why OnTix is the Future of Event Ticketing?
        </motion.h2>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {onTixBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
              className="cursor-pointer rounded-lg"
            >
              <div className="text-center p-6 bg-darkOrange text-secondary backdrop-blur-lg rounded-lg shadow-lg transition-all hover:scale-105 duration-500 ease-in-out hover:shadow-2xl">
                <div className="flex items-center justify-center mb-4">
                  {benefit.icon()}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.header}</h3>
                <p>{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
    </>
  );
};

export default Home;
