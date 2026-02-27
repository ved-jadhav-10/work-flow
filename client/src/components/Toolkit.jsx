import React from "react";

const Toolkit = () => {
  return (
    <section className="py-32 bg-white px-8">
      <div className="max-w-[90rem] mx-auto text-center">
        <h2 className="text-7xl font-extrabold text-black mb-6">
          The ultimate toolkit<br />for designers & teams
        </h2>
        <p className="text-gray-500 mb-20 max-w-3xl mx-auto text-2xl leading-relaxed">
          Everything you need to create, prototype, and collaborate - all in a
          single, easy-to-use platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1: Intuitive drag & drop editor */}
          <div className="bg-white rounded-[2.5rem] p-8 text-left hover:shadow-2xl transition border border-gray-100 flex flex-col items-start gap-8 group">
            <div className="bg-pink-50 w-full h-80 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                {/* Toolbar Mockup */}
                <div className="absolute top-6 left-6 flex gap-3 bg-white px-4 py-3 rounded-xl shadow-sm">
                    <span className="text-gray-400 text-sm">⟲</span>
                    <span className="text-gray-400 text-sm">T</span>
                    <span className="text-black text-sm font-bold bg-gray-200 px-2 rounded">🖼</span>
                    <span className="text-gray-400 text-sm">⇂</span>
                    <span className="text-gray-400 text-sm">☐</span>
                </div>
                
                {/* Gradient Shape */}
                <div className="w-64 h-40 rounded-3xl bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 relative shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition duration-300">
                    <div className="absolute -bottom-6 -right-6 bg-white p-2 rounded-lg shadow-lg cursor-pointer scale-125">
                        <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24"><path d="M21.405 13.922l-8.628-8.628c-1.354-1.354-3.535-1.355-4.891 0L5.342 7.842l6.062 6.061 9.998-10.001L21.405 13.922z"/></svg>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-black text-3xl mb-3">Intuitive drag & drop editor</h3>
                <p className="text-gray-500 text-xl leading-relaxed">
                    Create stunning designs effortlessly with a user-friendly interface.
                </p>
            </div>
          </div>

          {/* Card 2: Advanced prototyping */}
          <div className="bg-white rounded-[2.5rem] p-8 text-left hover:shadow-2xl transition border border-gray-100 flex flex-col items-start gap-8 group">
             <div className="bg-orange-50 w-full h-80 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                {/* Flowchart Mockup */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute top-12 left-12 w-20 h-20 bg-yellow-300 rounded-lg border-4 border-yellow-400 shadow-sm animate-pulse"></div>
                    
                    {/* Connection Line */}
                    <svg className="absolute w-full h-full pointer-events-none">
                        <path d="M110 90 C 150 90, 150 150, 190 150" stroke="#CBD5E1" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                         <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#CBD5E1" />
                            </marker>
                        </defs>
                    </svg>
                    <svg className="absolute w-full h-full pointer-events-none">
                        <path d="M280 160 L 280 110" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                        <rect x="250" y="50" width="60" height="60" rx="30" fill="#FDA4AF" />
                    </svg>

                    <div className="absolute bottom-16 right-24 w-20 h-20 bg-purple-300 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-sm border-4 border-purple-400 transform group-hover:scale-110 transition">😆</div>
                    <div className="absolute top-16 right-16 w-16 h-16 bg-red-300 rounded-full border-4 border-red-400 shadow-sm"></div>
                </div>
             </div>
             <div>
                <h3 className="font-bold text-black text-3xl mb-3">Advanced prototyping</h3>
                <p className="text-gray-500 text-xl leading-relaxed">
                    Turn ideas into interactive prototypes without writing a single line of code.
                </p>
             </div>
          </div>

          {/* Card 3: Real-time collaboration */}
          <div className="bg-white rounded-[2.5rem] p-8 text-left hover:shadow-2xl transition border border-gray-100 flex flex-col items-start gap-8 group">
             <div className="bg-indigo-50 w-full h-80 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                {/* Avatar Circles */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-56 h-56 border border-indigo-200 rounded-full opacity-50 animate-ping"></div>
                    <div className="absolute w-44 h-44 border border-indigo-200 rounded-full"></div>
                    
                    {/* Center Icon */}
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg z-10">💬</div>

                    {/* Floating Avatars */}
                    <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="absolute -top-16 bg-white p-1.5 w-12 h-12 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="absolute -bottom-14 -left-10 bg-white p-1.5 w-12 h-12 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=3" alt="Avatar" className="absolute bottom-6 -right-16 bg-white p-1.5 w-12 h-12 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=8" alt="Avatar" className="absolute top-0 -left-16 bg-white p-1.5 w-10 h-10 rounded-full shadow-md border border-gray-200 opacity-70" />
                    <img src="https://i.pravatar.cc/100?img=9" alt="Avatar" className="absolute top-10 -right-12 bg-white p-1.5 w-10 h-10 rounded-full shadow-md border border-gray-200 opacity-70" />
                </div>
             </div>
             <div>
                <h3 className="font-bold text-black text-3xl mb-3">Real-time collaboration</h3>
                <p className="text-gray-500 text-xl leading-relaxed">
                    Work seamlessly with your team, get instant feedback.
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Toolkit;
