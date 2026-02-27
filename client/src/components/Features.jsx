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
    <section className="py-40 bg-[#111] px-8">
       <div className="max-w-[85rem] mx-auto bg-[#1a1a1a] rounded-[5rem] p-24">
        <h2 className="text-7xl font-extrabold text-white text-center mb-24 max-w-4xl mx-auto leading-tight">
          Power up your workflow with next-gen features
        </h2>
        
        {/* Top Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Card 1: Cloud-based */}
            <div className="bg-[#222] rounded-[3rem] p-12 border border-gray-800 flex flex-col items-center text-center group h-[600px] relative overflow-hidden">
                 <div className="flex-1 w-full flex items-center justify-center relative">
                    {/* World Map Background (Abstract) */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain"></div>
                    
                    <div className="relative z-10 flex flex-col items-center mb-4 scale-150">
                        <div className="text-8xl mb-4 drop-shadow-[0_0_35px_rgba(255,255,255,0.2)] animate-pulse">{bigCards[0].emoji}</div>
                        {/* Connection dots */}
                        <div className="absolute top-0 right-[-100px] w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                        <div className="absolute bottom-[-20px] left-[-80px] w-3 h-3 bg-blue-500 rounded-full animate-ping delay-700"></div>
                        <div className="absolute top-[-40px] left-10 w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-300"></div>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-4xl font-bold text-white mb-6">{bigCards[0].title}</h3>
                    <p className="text-gray-400 text-xl leading-relaxed max-w-md mx-auto">{bigCards[0].desc}</p>
                 </div>
            </div>

            {/* Card 2: Performance */}
            <div className="bg-[#222] rounded-[3rem] p-12 border border-gray-800 flex flex-col items-center text-center group h-[600px] relative overflow-hidden">
                <div className="flex-1 w-full flex items-center justify-center relative">
                    <div className="relative z-10 scale-150">
                        <div className="text-8xl mb-4 drop-shadow-[0_0_35px_rgba(234,179,8,0.4)] transform group-hover:scale-110 transition duration-300">{bigCards[1].emoji}</div>
                    </div>
                    {/* Speed Lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent absolute top-1/2 rotate-45 transform translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></div>
                         <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent absolute top-1/3 rotate-45 transform translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 delay-100"></div>
                    </div>
                </div>
                 <div>
                    <h3 className="text-4xl font-bold text-white mb-6">{bigCards[1].title}</h3>
                    <p className="text-gray-400 text-xl leading-relaxed max-w-md mx-auto">{bigCards[1].desc}</p>
                 </div>
            </div>
        </div>

        {/* Bottom Small Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {smallCards.map((card, idx) => (
                <div key={idx} className="bg-[#222] rounded-[3rem] p-12 border border-gray-800 flex flex-col items-center text-center group hover:bg-[#2a2a2a] transition h-[500px]">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-[#333] flex items-center justify-center text-7xl mb-8 group-hover:scale-110 transition shadow-lg shadow-black/50">
                            {card.emoji}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-4">{card.title}</h3>
                        <p className="text-gray-400 text-xl leading-relaxed">{card.desc}</p>
                    </div>
                </div>
            ))}
        </div>
       </div>
    </section>
  );
};

export default Features;
