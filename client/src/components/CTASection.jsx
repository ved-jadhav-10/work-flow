import React from "react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-32 bg-white px-8">
      <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-center gap-16">
        
        {/* Left Side: Visual Mockup */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-2xl"
        >
             <div className="bg-[#f3f4f6] rounded-[3rem] p-12 relative overflow-hidden h-[600px] flex items-center justify-center">
                {/* Phone Mockup */}
                <div className="w-[320px] bg-black rounded-[2.5rem] p-6 text-white shadow-2xl relative z-10 border-[8px] border-black">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-6 px-1">
                        <span className="font-bold text-sm">Draftr.</span>
                        <div className="w-5 h-5 flex flex-col justify-center gap-1">
                            <span className="w-full h-0.5 bg-white rounded-full"></span>
                            <span className="w-full h-0.5 bg-white rounded-full"></span>
                        </div>
                    </div>

                    <h3 className="text-xl font-medium text-center mb-6 text-gray-200">
                        Welcome to our food store
                    </h3>

                    <div className="space-y-4">
                        {/* Food Item 1 */}
                        <div className="bg-[#1a1a1a] p-3 rounded-xl flex items-center gap-3">
                             <div className="w-12 h-12 bg-orange-500 rounded-lg shrink-0 flex items-center justify-center text-xl">🍗</div>
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium truncate">Chicken popcorn</p>
                                 <p className="text-xs text-yellow-400 font-bold">200$</p>
                             </div>
                        </div>
                         {/* Food Item 2 */}
                         <div className="bg-[#1a1a1a] p-3 rounded-xl flex items-center gap-3">
                             <div className="w-12 h-12 bg-red-500 rounded-lg shrink-0 flex items-center justify-center text-xl">🍔</div>
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium truncate">Large burger</p>
                                 <p className="text-xs text-yellow-400 font-bold">21$</p>
                             </div>
                        </div>
                         {/* Food Item 3 */}
                         <div className="bg-[#1a1a1a] p-3 rounded-xl flex items-center gap-3">
                             <div className="w-12 h-12 bg-green-500 rounded-lg shrink-0 flex items-center justify-center text-xl">🍕</div>
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium truncate">Pizza house</p>
                                 <p className="text-xs text-yellow-400 font-bold">45$</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Floating Palette Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute top-1/3 -right-4 md:right-12 bg-white rounded-2xl p-4 shadow-xl w-64 z-20 border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm text-black">Color style</span>
                        <div className="flex gap-2">
                             <span className="w-4 h-4 rounded text-gray-400 text-xs flex items-center justify-center">🖌️</span>
                             <span className="w-4 h-4 rounded text-gray-400 text-xs flex items-center justify-center">✨</span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-100 rounded-lg p-2 mb-4 flex items-center gap-2">
                        <span className="text-gray-400 text-xs">🔍</span>
                        <span className="text-gray-400 text-xs">Search...</span>
                    </div>

                    <div className="flex gap-2 justify-between">
                        <div className="w-8 h-8 rounded-full bg-black border-2 border-transparent hover:scale-110 transition-transform cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-[#d9f99d] border-2 border-transparent hover:scale-110 transition-transform cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-[#4ade80] border-2 border-transparent hover:scale-110 transition-transform cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-[#ef4444] border-2 border-transparent hover:scale-110 transition-transform cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-[#3b82f6] border-2 border-transparent hover:scale-110 transition-transform cursor-pointer"></div>
                    </div>
                </motion.div>
             </div>
        </motion.div>

        {/* Right Side: Text & List */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 max-w-2xl text-left pl-0 md:pl-8"
        >
            <h2 className="text-6xl font-extrabold text-black leading-[1.1] mb-8 tracking-tight">
                The perfect design solution for every workflow
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
                Discover how our design platform fits your needs, whether you're a freelancer, startup, or enterprise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {[
                    "UI/UX designers", "App & Web developers",
                    "Product teams", "Marketing teams",
                    "Enterprises Organizations", "Agencies & Enterprises"
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                        <span className="text-[#6366f1] text-xl group-hover:translate-x-1 transition-transform">→</span>
                        <span className="text-lg font-medium text-gray-800 group-hover:text-[#6366f1] transition-colors">{item}</span>
                    </div>
                ))}
            </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CTASection;
