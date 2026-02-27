import React from 'react';

const Footer = () => {
    return (
      <footer className="bg-black text-white pt-24 pb-12 px-8 border-t border-gray-900 relative">
        <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row justify-between items-start gap-20 pb-20">
          
          {/* Left Column: Brand & Social */}
          <div className="flex flex-col h-full min-h-[200px] justify-between flex-1">
              {/* Brand Logo */}
              <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-3">
                       <div className="w-8 h-8 flex items-center justify-center">
                          {/* Crown/Lotus Icon - White */}
                          <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                             <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
                          </svg>
                       </div>
                       <span className="text-3xl font-bold tracking-tight text-white">Draftr</span>
                  </div>
              </div>
          </div>
  
          {/* Right Columns: Links */}
          <div className="flex gap-24 text-left">
              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg mb-8 text-white">Quick Links</h4>
                <ul className="space-y-4 text-left">
                    {["Home", "Features", "Pricing", "Download"].map((link) => (
                      <li key={link}>
                           <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium block">{link}</a>
                      </li>
                    ))}
                </ul>
              </div>
  
              {/* All Pages */}
              <div>
                <h4 className="font-bold text-lg mb-8 text-white">All Pages</h4>
                <ul className="space-y-4 text-left">
                    {[
                        { name: "Power-Ups", badge: "New" },
                        { name: "About us" },
                        { name: "Contact us" },
                        { name: "Blog" },
                    ].map((item, i) => (
                      <li key={i}>
                           <div className="flex items-center gap-2">
                               <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{item.name}</a>
                               {item.badge && (
                                  <span className="bg-[#6366f1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                      {item.badge}
                                  </span>
                               )}
                           </div>
                      </li>
                    ))}
                </ul>
              </div>
          </div>
  
        </div>
  
        {/* Floating Toolbar (Centered) */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] border border-gray-800 rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl z-50">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#333] text-white hover:bg-gray-700 transition">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-800 transition">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11"/></svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
             </button>
             <div className="w-[1px] h-6 bg-gray-700 mx-2"></div>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
             </button>
             
             <button className="flex items-center gap-1 bg-[#2a2a2a] text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-700 ml-2 hover:bg-[#333]">
                 59% <span className="text-gray-400">⌄</span>
             </button>
             
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold ml-2 shadow-lg shadow-blue-900/50">
                 Upgrade Now
             </button>
        </div>
      </footer>
    );
  };
  
  export default Footer;