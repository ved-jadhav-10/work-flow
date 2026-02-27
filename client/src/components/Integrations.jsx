import React from "react";

const integrations = [
  { icon: "📊", bg: "bg-white" }, // Analytics
  { icon: "layers", bg: "bg-indigo-900", color: "text-cyan-400" }, // Layers/Diamond
  { icon: "🔊", bg: "bg-blue-500", color: "text-white" }, // Audio 
  { icon: "angle", bg: "bg-indigo-900", color: "text-yellow-400" }, // Framer-like
  { icon: "pie", bg: "bg-emerald-900", color: "text-emerald-400" }, // Green icon

  { icon: "bubbles", bg: "bg-indigo-800", color: "text-purple-300" }, // Slack/Gather
  { icon: "✎", bg: "bg-blue-600", color: "text-white" }, // Edit
  { icon: "G", bg: "bg-red-600", color: "text-white" }, // Red G
  { icon: "L", bg: "bg-slate-700", color: "text-blue-300" }, // Linear-like
  { icon: "✈️", bg: "bg-pink-400", color: "text-white" }, // Paper plane
];

const Integrations = () => {
  return (
    <section className="py-32 bg-white px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24">
        {/* Left Side: Visual Graph */}
        <div className="flex-1 bg-gray-50 rounded-[2.5rem] p-12 relative min-h-[500px] flex flex-col items-center justify-center">
             {/* Top Row */}
             <div className="flex justify-between w-full max-w-sm mb-12 relative z-10 px-4">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl text-gray-700">📊</div>
                <div className="w-14 h-14 bg-[#1e1e2e] rounded-2xl shadow-sm flex items-center justify-center text-xl text-cyan-400">❖</div>
                <div className="w-14 h-14 bg-[#3b82f6] rounded-2xl shadow-sm flex items-center justify-center text-xl text-white">🔊</div>
                <div className="w-14 h-14 bg-[#4c1d95] rounded-2xl shadow-sm flex items-center justify-center text-xl text-yellow-500">◆</div>
                <div className="w-14 h-14 bg-[#0f766e] rounded-2xl shadow-sm flex items-center justify-center text-xl text-emerald-300">◕</div>
             </div>
             
             {/* Bottom Row */}
             <div className="flex justify-between w-full max-w-sm mb-24 relative z-10 px-4">
                <div className="w-14 h-14 bg-[#581c87] rounded-2xl shadow-sm flex items-center justify-center text-xl text-white">ooo</div>
                <div className="w-14 h-14 bg-[#3b82f6] rounded-2xl shadow-sm flex items-center justify-center text-xl text-white">✎</div>
                <div className="w-14 h-14 bg-[#dc2626] rounded-2xl shadow-sm flex items-center justify-center text-xl text-white font-bold">G</div>
                <div className="w-14 h-14 bg-[#1e293b] rounded-2xl shadow-sm flex items-center justify-center text-xl text-sky-300 font-serif font-bold">L</div>
                <div className="w-14 h-14 bg-[#f472b6] rounded-2xl shadow-sm flex items-center justify-center text-xl text-white">✈️</div>
             </div>

              {/* Connecting Lines SVG */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <svg className="w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="none">
                    {/* Paths from top row (approx Y=150) to center (X=250, Y=350) */}
                    <path d="M100 160 C 100 250, 250 250, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M175 160 C 175 250, 250 250, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M250 160 C 250 250, 250 250, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M325 160 C 325 250, 250 250, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M400 160 C 400 250, 250 250, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />

                    {/* Paths from bottom row (approx Y=260) to center */}
                    <path d="M100 260 C 100 300, 250 300, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M175 260 C 175 300, 250 300, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M250 260 C 250 300, 250 300, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M325 260 C 325 300, 250 300, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                    <path d="M400 260 C 400 300, 250 300, 250 340" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
                 </svg>
             </div>

             {/* Central Hub */}
             <div className="relative z-20 mt-[-20px]">
                 <div className="w-20 h-20 bg-gradient-to-b from-[#a855f7] to-[#7c3aed] rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200">
                    <span className="text-4xl text-white">♕</span> 
                 </div>
             </div>
        </div>

        {/* Right Side: Text Content */}
        <div className="flex-1 pl-10">
          <h2 className="text-5xl font-extrabold text-black mb-6 leading-tight">
            One platform, <br/> unlimited <br/> integrations
          </h2>
          
          <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition mb-12 shadow-lg">
            View all integrations
          </button>
          
          <div className="mt-8">
            <p className="text-gray-900 text-sm font-medium leading-relaxed mb-4 max-w-md">
              "Our platform empowers teams to collaborate, innovate, and bring
              ideas to life—seamlessly and effortlessly."
            </p>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=11" alt="Author" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-black">Daniel Vaughn</span>
                  <span className="text-[10px] text-gray-500 font-medium">Founder & CEO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
