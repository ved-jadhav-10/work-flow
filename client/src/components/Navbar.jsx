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
      <div className="max-w-[90rem] mx-auto px-8 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 text-2xl font-bold text-black tracking-tight">
          <span className="text-3xl text-purple-600">♛</span>
          Draftr
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-10 text-gray-600 font-medium text-lg">
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
        <button className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition">
          Login now
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
