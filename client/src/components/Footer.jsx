import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-xl font-bold mb-4">
            🧠 Cognify AI
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Empowering teams to collaborate, innovate, and bring ideas to life.
          </p>
          <p className="text-gray-500 text-xs mb-3">Follow us on</p>
          <div className="flex gap-3">
            {[
              { icon: "f", label: "Facebook" },
              { icon: "𝕏", label: "Twitter" },
              { icon: "▶", label: "YouTube" },
              { icon: "in", label: "LinkedIn" },
              { icon: "★", label: "GitHub" },
            ].map((s) => (
              <span
                key={s.label}
                title={s.label}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-700 hover:text-purple-400 transition"
              >
                {s.icon}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4 text-white">Quick Links</h4>
          {["Home", "Features", "Pricing", "Download"].map((link) => (
            <p
              key={link}
              className="text-gray-400 text-sm mb-2 hover:text-white cursor-pointer transition"
            >
              {link}
            </p>
          ))}
        </div>

        {/* All Pages */}
        <div>
          <h4 className="font-bold mb-4 text-white">All Pages</h4>
          {[
            "Power-Ups",
            "About us",
            "Contact us",
            "Blog",
            "Waitlist",
            "Changelog",
            "Privacy Policy",
            "404",
          ].map((page) => (
            <p
              key={page}
              className="text-gray-400 text-sm mb-2 hover:text-white cursor-pointer transition"
            >
              {page}
            </p>
          ))}
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold mb-4 text-white">Stay Updated</h4>
          <p className="text-gray-400 text-sm mb-4">
            Subscribe to get the latest updates and news.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg flex-1 outline-none border border-gray-700 focus:border-purple-500"
            />
            <button className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-purple-700 transition whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-xs">
          © 2026 Cognify AI. All rights reserved.
        </p>
        <p className="text-gray-600 text-xs">
          Built with React & Node.js
        </p>
      </div>
    </footer>
  );
};

export default Footer;
