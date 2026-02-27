import React from "react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-purple-200 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Badge */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 text-gray-600 text-sm pl-1 pr-4 py-1 rounded-full mb-8 shadow-sm">
        <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
          New
        </span>
        Revolutionize your design workflow
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
      <button className="mt-10 flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white pl-8 pr-2 py-2 rounded-full text-lg font-semibold transition shadow-lg shadow-purple-200">
        Get Started - It's free
        <div className="bg-white text-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-sm">
          →
        </div>
      </button>

      {/* App Screenshots Mockup */}
      <div className="mt-16 flex flex-col md:flex-row gap-6 justify-center items-start max-w-6xl w-full px-4">
        {/* Left Big Panel - Browser Mockup */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full md:w-2/3 h-[500px] flex flex-col relative">
          {/* Browser Header */}
          <div className="bg-white px-4 h-12 flex items-center justify-between border-b border-gray-100">
             <div className="flex gap-4 items-center w-1/3">
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                 </div>
                 <div className="text-gray-400 text-lg">≡</div>
             </div>
            
            <span className="text-xs text-gray-500 font-medium w-1/3 text-center">Agency / Portfolio</span>
            
            <div className="flex items-center justify-end gap-3 w-1/3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-white" />
                <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
                <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-white text-white text-[8px] flex items-center justify-center font-bold">8</div>
              </div>
              <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-blue-700">
                Share
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Toolbar */}
            <div className="w-12 border-r border-gray-100 flex flex-col items-center py-4 gap-6 bg-white shrink-0 z-10">
               <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-md cursor-pointer">▶</div>
               <div className="flex flex-col gap-5 text-gray-400 text-lg">
                  <span className="cursor-pointer hover:text-black">✎</span>
                  <span className="cursor-pointer hover:text-black">T</span>
                  <span className="cursor-pointer hover:text-black">#</span>
                  <span className="cursor-pointer hover:text-black">□</span>
                  <span className="cursor-pointer hover:text-black">⊞</span>
                  <span className="cursor-pointer hover:text-black">Q</span>
               </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-50 p-8 relative overflow-hidden">
                {/* User Cursor */}
                <div className="absolute top-12 right-12 z-20 flex items-center gap-2">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 cursor-pointer">
                        Judy Holda 
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M21.405 13.922l-8.628-8.628c-1.354-1.354-3.535-1.355-4.891 0L5.342 7.842l6.062 6.061 9.998-10.001L21.405 13.922z"/></svg> 
                    </div>
                </div>

                {/* Website Content Mockup */}
                <div className="bg-white w-full h-full shadow-sm border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                     {/* Inside Website Nav */}
                     <div className="h-14 flex items-center justify-between px-8 border-b border-gray-100">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span className="text-orange-500 text-xl">▲</span>
                            Roofinger
                        </div>
                        <div className="hidden md:flex gap-6 text-xs font-semibold text-gray-500">
                            <span>Home</span>
                            <span>Pages</span>
                            <span>About</span>
                            <span>Services</span>
                        </div>
                        <button className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded shadow-sm">
                            Contact Us
                        </button>
                     </div>

                     {/* Inside Website Hero */}
                     <div className="flex-1 flex overflow-hidden">
                        <div className="w-1/2 p-10 flex flex-col justify-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                                Durable, long-lasting roofing
                            </h2>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                Designed for maximum strength and longevity, providing reliable protection for your home year after year.
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="bg-yellow-400 text-black text-xs font-bold px-5 py-2.5 rounded shadow-sm hover:bg-yellow-500">
                                    Get free estimate
                                </button>
                                <span className="text-xs font-bold text-gray-600">+1 (000) 123-4567</span>
                            </div>
                        </div>
                        <div className="w-1/2 bg-gray-800 relative overflow-hidden">
                             {/* Placeholder for Worker Image */}
                             <img 
                                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                                alt="Construction Worker" 
                                className="object-cover w-full h-full opacity-80"
                             />
                             {/* Floating Play Button */}
                             <div className="absolute bottom-6 left-6 bg-orange-400 rounded-full p-2 text-white shadow-lg">
                                ▶
                             </div>
                        </div>
                     </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Small Panel - Card */}
        <div className="bg-white rounded-2xl shadow-xl w-full md:w-1/3 h-[500px] border border-gray-100 overflow-hidden flex flex-col relative">
          <div className="p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg text-black">Draftr.</h3>
            <button className="bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition">
              Get it for FREE 
              <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">↗</span>
            </button>
          </div>
          
          <div className="flex-1 bg-yellow-200 m-4 rounded-2xl relative overflow-hidden flex items-center justify-center">
             {/* Abstract 3D shape placeholder */}
             <div className="w-48 h-48 relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                 <div className="relative z-10 w-full h-full bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 rounded-full border-[16px] border-yellow-200 shadow-inner flex items-center justify-center">
                    <div className="w-20 h-20 bg-yellow-200 rounded-full shadow-inner"></div>
                 </div>
                 {/* Floating elements */}
                 <div className="absolute top-0 right-0 w-8 h-8 bg-orange-400 rounded transform rotate-12 shadow-lg"></div>
                 <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-600 rounded-full shadow-lg"></div>
                 <div className="absolute top-10 -left-6 w-12 h-2 bg-pink-400 transform -rotate-45 rounded-full"></div>
             </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-xl flex items-center gap-6 shadow-2xl z-20 w-3/4 justify-between">
             <div className="flex gap-1">
                <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
             </div>
             <div className="flex gap-4 text-sm">
                <span className="hover:text-gray-300 cursor-pointer">⏏</span>
                <span className="hover:text-gray-300 cursor-pointer">≡</span>
                <span className="hover:text-gray-300 cursor-pointer">||</span>
                <span className="hover:text-gray-300 cursor-pointer">▶|</span>
             </div>
             <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
