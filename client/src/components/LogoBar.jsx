import React from "react";
import { motion } from "framer-motion";

const LogoBar = () => {
  const logos = [
    // Swiss
    {
      id: 1,
      component: (
        <div className="flex items-center gap-3 group cursor-pointer">
           <div className="w-8 h-8 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gray-300 opacity-20 group-hover:bg-gray-800 transition-colors rounded-sm rotate-45 transform scale-75"></div>
              <div className="w-1 h-4 bg-gray-400 group-hover:bg-black transition-colors rounded-full absolute"></div>
              <div className="w-4 h-1 bg-gray-400 group-hover:bg-black transition-colors rounded-full absolute"></div>
           </div>
           <span className="text-2xl font-bold tracking-tight text-gray-400 group-hover:text-black transition-colors">Swiss</span>
        </div>
      ),
    },
    // KOBE
    {
      id: 2,
      component: (
        <div className="flex items-center gap-3 group cursor-pointer">
           <span className="text-3xl font-black text-gray-400 group-hover:text-black transition-colors">市</span>
           <span className="text-2xl font-bold tracking-wider text-gray-400 group-hover:text-black transition-colors">KOBE</span>
        </div>
      ),
    },
    // On_Event
    {
      id: 3,
      component: (
        <div className="flex items-center gap-2 group cursor-pointer">
           <div className="flex flex-col items-center leading-none">
               <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-gray-500 transition-colors">{"</>"}</span>
               <span className="text-xl font-bold tracking-tight text-gray-400 group-hover:text-black transition-colors">On_Event</span>
           </div>
        </div>
      ),
    },
    // Thrn (Script)
    {
      id: 4,
      component: (
        <div className="group cursor-pointer">
           <svg viewBox="0 0 100 40" className="h-10 w-auto fill-current text-gray-400 group-hover:text-black transition-colors">
               <path d="M10,20 C15,10 25,10 30,20 C35,30 45,30 50,20 M 60,25 L 80,15" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
               <text x="35" y="28" fontFamily="cursive" fontWeight="bold" fontSize="24">Thrn</text>
           </svg>
        </div>
      ),
    },
    // oslo.
    {
      id: 5,
      component: (
        <div className="group cursor-pointer">
          <span className="text-3xl font-black tracking-tighter lowercase text-gray-400 group-hover:text-black transition-colors">oslo.</span>
        </div>
      ),
    },
    // Imprintify
    {
      id: 6,
      component: (
        <div className="flex items-center gap-2 group cursor-pointer">
           <div className="flex items-end gap-0.5 h-6">
                <div className="w-1.5 h-3 bg-gray-400 group-hover:bg-black transition-colors rounded-t-sm"></div>
                <div className="w-1.5 h-5 bg-gray-400 group-hover:bg-black transition-colors rounded-t-sm"></div>
                <div className="w-1.5 h-4 bg-gray-400 group-hover:bg-black transition-colors rounded-t-sm"></div>
           </div>
           <span className="text-xl font-bold text-gray-400 group-hover:text-black transition-colors">Imprintify</span>
        </div>
      ),
    },
    // Berlin.
    {
      id: 7,
      component: (
        <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 border-2 border-gray-400 group-hover:border-black rounded-lg flex items-center justify-center transition-colors">
                 <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-black transition-colors"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-300 group-hover:text-black transition-colors">Berlin.</span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden relative border-b border-gray-100">
      <div className="max-w-7xl mx-auto text-center mb-16">
           <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
             Trusted by leading teams worldwide
           </p>
      </div>

      {/* Infinite scrolling carousel */}
      <div className="relative flex overflow-hidden w-full">
          <motion.div 
            className="flex gap-32 items-center whitespace-nowrap min-w-full"
            animate={{ x: ["0%", "-100%"] }}
            transition={{ 
                duration: 40, 
                ease: "linear", 
                repeat: Infinity 
            }}
          >
            {/* Duplicate logos multiple times to ensure smooth loop on wide screens */}
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
                <div key={index} className="flex-shrink-0 flex items-center justify-center h-20 w-40">
                    {logo.component}
                </div>
            ))}
          </motion.div>
      </div>
      
      {/* Side Fades for elegant infinite feel */}
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default LogoBar;
