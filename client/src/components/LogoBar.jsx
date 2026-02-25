import React from "react";

const logos = [
  "KOBE",
  "On_Edge",
  "Thrar—",
  "OSLO.",
  "Imprntly",
  "Berlin",
  "↺ U-Turn",
  "+5 more",
];

const LogoBar = () => {
  return (
    <section className="py-12 bg-white border-t border-b border-gray-100">
      <p className="text-center text-gray-400 text-sm mb-6 font-medium">
        Trusted by leading teams worldwide
      </p>
      <div className="flex flex-wrap items-center justify-center gap-10 px-10">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-gray-400 font-semibold text-base tracking-wide hover:text-black transition cursor-pointer"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
};

export default LogoBar;
