import React from "react";

const bigCards = [
  {
    emoji: "☁️",
    title: "Cloud-based accessibility",
    desc: "Access your projects anytime, anywhere—no downloads or installations needed. Your work lives in the cloud.",
  },
  {
    emoji: "⚡",
    title: "Fast & secure performance",
    desc: "Experience lightning-fast speed with enterprise-level security, access control, and version history.",
  },
];

const smallCards = [
  {
    emoji: "✏️",
    title: "Effortless design experience",
    desc: "Intuitive interface and smart AI tools to speed up your creative process.",
  },
  {
    emoji: "🔀",
    title: "Hassle-free prototyping",
    desc: "Transform static designs into interactive prototypes in just a few clicks.",
  },
  {
    emoji: "📤",
    title: "One-click export & handoff",
    desc: "Generate code, export assets, and collaborate with developers effortlessly.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-[#111] px-6">
       <div className="max-w-5xl mx-auto bg-[#1a1a1a] rounded-[3rem] p-16">
        <h2 className="text-4xl font-extrabold text-white text-center mb-16 max-w-xl mx-auto leading-tight">
          Power up your workflow with next-gen features
        </h2>
        
        {/* Top Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Card 1: Cloud-based */}
            <div className="bg-[#222] rounded-3xl p-8 border border-gray-800 flex flex-col items-center text-center group h-96 relative overflow-hidden">
                 <div className="flex-1 w-full flex items-center justify-center relative">
                    {/* World Map Background (Abstract) */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain"></div>
                    
                    <div className="relative z-10 flex flex-col items-center mb-4">
                        <div className="w-20 h-20 text-blue-500 mb-2">
                             <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-5 4 5h-3v4h-2z"/></svg>
                        </div>
                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    </div>

                    <div className="absolute top-1/2 left-10 transform -translate-y-1/2 bg-[#333] text-yellow-500 text-[10px] font-bold px-2 py-1 rounded border border-yellow-600/30">Fully sync</div>
                    <div className="absolute top-1/2 right-10 transform -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded">Mark out</div>
                 </div>
                 
                 <div className="z-10 bg-[#222] pt-4 w-full">
                    <h3 className="text-white font-bold text-lg mb-2">Cloud-based accessibility</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">Access your projects anytime, anywhere—no downloads or installation needed.</p>
                 </div>
            </div>

            {/* Card 2: Fast & Secure */}
             <div className="bg-[#222] rounded-3xl p-8 border border-gray-800 flex flex-col items-center text-center group h-96 relative overflow-hidden">
                 <div className="flex-1 w-full flex items-center justify-center gap-6">
                    <div className="w-16 h-24 text-yellow-400">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                    </div>
                    <div className="text-gray-600 text-4xl animate-pulse">»</div>
                    <div className="w-20 h-24 text-emerald-500 relative">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-xl font-bold mt-1">
                            <span className="block w-2 h-4 bg-black rounded-full mx-auto mb-0.5"></span>
                            <span className="block w-3 h-3 bg-black rounded-full mx-auto"></span>
                        </div>
                    </div>
                 </div>
                 
                 <div className="z-10 bg-[#222] pt-4 w-full">
                    <h3 className="text-white font-bold text-lg mb-2">Fast & secure performance</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">Experience lightning-fast speed with enterprise-level security and version control.</p>
                 </div>
            </div>
        </div>

        {/* Bottom Small Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
              {icon: "🚀", title: "Effortless design experience", desc: "Intuitive interface and smart tools to speed up your creative process."},
              {icon: "🔀", title: "Hassle-free prototyping", desc: "Transform static designs into interactive prototypes in just a few clicks."},
              {icon: "📦", title: "One-click export & handoff", desc: "Generate code, export assets, and collaborate with developers effortlessly."}
          ].map((card, i) => (
             <div key={i} className="flex flex-col items-start text-left">
                  <div className="w-10 h-10 bg-[#333] rounded-lg flex items-center justify-center text-white text-lg mb-4 shadow-inner">
                      {card.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-xs">{card.desc}</p>
             </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
