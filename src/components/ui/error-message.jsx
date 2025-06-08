/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";

const ErrorMessage = ({ errorCode, errorName, errorMessage }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/', { replace: true });
    };

    return (
        <main className="h-screen w-full flex flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <motion.p
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [40, 0, 0],
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="text-base font-semibold text-pink-600">{errorCode}</motion.p>
                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [40, 0, 0],
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{errorName}</motion.h1>
                <motion.p
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [40, 0, 0],
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="mt-6 text-base leading-7 text-slate-600">{errorMessage}</motion.p>
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [40, 0, 0],
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onClick={handleGoHome}
                        className="bg-pink-600 rounded-md hover:bg-gradient-to-b hover:from-pink-500 hover:to-pink-400 hover:text-white hover:shadow-xl hover:transition hover:duration-200 px-3.5 py-2.5 text-sm font-semibold text-white"
                    >
                        Go back home
                    </button>
                </motion.div>
            </div>
        </main>
    );
};

export default ErrorMessage;