import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-bold text-black">
          <span className="text-2xl">🧠</span>
          Cognify AI
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8 text-gray-600 font-medium text-sm">
          {["About", "Blog", "Changelog", "Contact", "Power-Ups"].map((item) => (
            <li
              key={item}
              className="hover:text-black cursor-pointer transition"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition">
          Login now
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
