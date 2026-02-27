import React from "react";

const logos = [
  "Swiss",
  "KOBE",
  "On_Event",
  "Thrn",
  "oslo.",
  "Imprintify",
  "Berlin.",
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
