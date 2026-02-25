import React from "react";

const icons = ["📊", "🎯", "🔊", "💜", "👤", "🟣", "✂️", "🔴", "🌙", "🎀"];

const Integrations = () => {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Icon Grid */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-10 border border-gray-200">
          <div className="grid grid-cols-5 gap-4 mb-8">
            {icons.map((icon, i) => (
              <div
                key={i}
                className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-gray-100 hover:shadow-md transition cursor-pointer"
              >
                {icon}
              </div>
            ))}
          </div>
          {/* Connector to logo */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-8 bg-gray-300" />
              <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                🧠
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-black mb-6">
            One platform, unlimited integrations
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Connect Cognify AI with all your favorite tools. From design to
            development, everything works together seamlessly.
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition mb-8">
            View all integrations
          </button>
          <blockquote className="border-l-4 border-gray-200 pl-4">
            <p className="text-gray-500 text-sm italic leading-relaxed mb-3">
              "Our platform empowers teams to collaborate, innovate, and bring
              ideas to life—seamlessly and effortlessly."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold">
                D
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Daniel Vaughn, Founder & CEO
              </span>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
