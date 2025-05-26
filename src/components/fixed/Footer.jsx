import { navList } from "../../utils/list";

export const Footer = () => {
    return (
        <footer className="bg-pink-50 text-slate-950 py-6 border-t border-pink-700 shadow-lg">
            <ul className="text-md flex items-center justify-center flex-col gap-4 md:flex-row md:gap-12 transition-all duration-500 py-4">
                <li className="font-semibold text-center">
                    <span>
                        ©{" "}
                        <a
                            href="#"
                            className="hover:text-pink-700 transition-colors duration-300"
                        >
                            OnTix
                        </a>{" "}
                        2024, All rights reserved.
                    </span>
                </li>
                {navList.map((nav, index) => (
                    <li key={index}>
                        <a
                            className="text-slate-950 hover:text-pink-700 transition-colors duration-300"
                            href={nav.url}
                        >
                            {nav.title}
                        </a>
                    </li>
                ))}
            </ul>
        </footer>
    );
};

export default Footer;