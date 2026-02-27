import React from "react";

const Toolkit = () => {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-black mb-4">
          The ultimate toolkit for designers & teams
        </h2>
        <p className="text-gray-500 mb-16 max-w-2xl mx-auto text-lg">
          Everything you need to create, prototype, and collaborate - all in a
          single, easy-to-use platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Intuitive drag & drop editor */}
          <div className="bg-white rounded-3xl p-6 text-left hover:shadow-xl transition border border-gray-100 flex flex-col items-start gap-6 group">
            <div className="bg-pink-50 w-full h-64 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Toolbar Mockup */}
                <div className="absolute top-4 left-4 flex gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <span className="text-gray-400 text-xs">⟲</span>
                    <span className="text-gray-400 text-xs">T</span>
                    <span className="text-black text-xs font-bold bg-gray-200 px-1 rounded">🖼</span>
                    <span className="text-gray-400 text-xs">⇂</span>
                    <span className="text-gray-400 text-xs">☐</span>
                </div>
                
                {/* Gradient Shape */}
                <div className="w-48 h-32 rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 relative shadow-lg transform rotate-[-5deg] group-hover:rotate-0 transition duration-300">
                    <div className="absolute -bottom-4 -right-4 bg-white p-1 rounded shadow-lg cursor-pointer">
                        <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M21.405 13.922l-8.628-8.628c-1.354-1.354-3.535-1.355-4.891 0L5.342 7.842l6.062 6.061 9.998-10.001L21.405 13.922z"/></svg>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-black text-lg mb-2">Intuitive drag & drop editor</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Create stunning designs effortlessly with a user-friendly interface.
                </p>
            </div>
          </div>

          {/* Card 2: Advanced prototyping */}
          <div className="bg-white rounded-3xl p-6 text-left hover:shadow-xl transition border border-gray-100 flex flex-col items-start gap-6 group">
             <div className="bg-orange-50 w-full h-64 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Flowchart Mockup */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300 rounded border-2 border-yellow-400 shadow-sm animate-pulse"></div>
                    
                    {/* Connection Line */}
                    <svg className="absolute w-full h-full pointer-events-none">
                        <path d="M110 90 C 150 90, 150 150, 190 150" stroke="#CBD5E1" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                         <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#CBD5E1" />
                            </marker>
                        </defs>
                    </svg>
                    <svg className="absolute w-full h-full pointer-events-none">
                        <path d="M240 130 L 240 90" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                        <rect x="220" y="40" width="40" height="40" rx="20" fill="#FDA4AF" />
                    </svg>

                    <div className="absolute bottom-12 right-20 w-16 h-16 bg-purple-300 rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-purple-400 transform group-hover:scale-110 transition">😆</div>
                    <div className="absolute top-12 right-12 w-12 h-12 bg-red-300 rounded-full border-2 border-red-400 shadow-sm"></div>
                </div>
             </div>
             <div>
                <h3 className="font-bold text-black text-lg mb-2">Advanced prototyping</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Turn ideas into interactive prototypes without writing a single line of code.
                </p>
             </div>
          </div>

          {/* Card 3: Real-time collaboration */}
          <div className="bg-white rounded-3xl p-6 text-left hover:shadow-xl transition border border-gray-100 flex flex-col items-start gap-6 group">
             <div className="bg-indigo-50 w-full h-64 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Avatar Circles */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-48 h-48 border border-indigo-200 rounded-full opacity-50 animate-ping"></div>
                    <div className="absolute w-36 h-36 border border-indigo-200 rounded-full"></div>
                    
                    {/* Center Icon */}
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-10">💬</div>

                    {/* Floating Avatars */}
                    <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="absolute -top-12 bg-white p-1 w-10 h-10 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="absolute -bottom-10 -left-8 bg-white p-1 w-10 h-10 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=3" alt="Avatar" className="absolute bottom-4 -right-12 bg-white p-1 w-10 h-10 rounded-full shadow-md border border-gray-200" />
                    <img src="https://i.pravatar.cc/100?img=8" alt="Avatar" className="absolute top-0 -left-12 bg-white p-1 w-8 h-8 rounded-full shadow-md border border-gray-200 opacity-70" />
                    <img src="https://i.pravatar.cc/100?img=9" alt="Avatar" className="absolute top-8 -right-10 bg-white p-1 w-8 h-8 rounded-full shadow-md border border-gray-200 opacity-70" />
                </div>
             </div>
             <div>
                <h3 className="font-bold text-black text-lg mb-2">Real-time collaboration</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
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
