import React from "react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-purple-100 to-purple-200 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
      {/* Badge */}
      <div className="flex items-center gap-2 bg-black text-white text-sm px-4 py-1.5 rounded-full mb-8">
        <span className="bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold">
          New
        </span>
        Revolutionize your AI workflow
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-7xl font-extrabold text-black leading-tight max-w-4xl">
        Bring ideas to life in just a few clicks.
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-gray-500 text-lg max-w-2xl leading-relaxed">
        Design, prototype, and collaborate in real-time - all in one powerful
        platform. Elevate your{" "}
        <span className="font-bold text-black">creative process</span> with{" "}
        <span className="font-bold text-black">seamless teamwork</span> and
        limitless possibilities.
      </p>

      {/* CTA */}
      <button className="mt-10 flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-lg">
        Get Started • it's free
        <span className="bg-white text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
          →
        </span>
      </button>

      {/* App Screenshots Mockup */}
      <div className="mt-16 flex gap-4 justify-center items-start max-w-4xl w-full">
        {/* Left Big Panel */}
        <div className="bg-white rounded-2xl shadow-2xl w-2/3 h-72 border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-gray-400">Agency / Portfolio</span>
            <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
              Edit
            </span>
          </div>
          <div className="flex flex-1">
            <div className="w-10 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-3 gap-3">
              {["☰", "✎", "◻", "T", "⊞"].map((icon, k) => (
                <span key={k} className="text-gray-400 text-xs">
                  {icon}
                </span>
              ))}
            </div>
            <div className="flex-1 p-4 bg-white">
              <div className="bg-gray-900 rounded-lg h-32 flex items-center justify-center">
                <p className="text-white text-sm font-bold">
                  Durable, long-lasting AI
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-2 bg-gray-100 rounded flex-1" />
                <div className="h-2 bg-gray-100 rounded flex-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Small Panel */}
        <div className="bg-white rounded-2xl shadow-2xl w-1/3 h-72 border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
            <span className="text-xs font-bold text-gray-700">Cognify AI</span>
            <span className="text-gray-400 text-xs">✕</span>
          </div>
          <div className="flex-1 bg-gradient-to-br from-purple-400 to-pink-400 m-3 rounded-xl flex items-center justify-center">
            <span className="text-white text-5xl">🧠</span>
          </div>
          <div className="px-3 pb-3 flex gap-1 justify-center">
            {["⬛", "▶", "⏸", "⏭"].map((b, k) => (
              <span
                key={k}
                className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
