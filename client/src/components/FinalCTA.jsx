import React, { useState } from "react";
import { motion } from "framer-motion";

const FinalCTA = () => {
    // For the "live collaboration" cursor effect
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left - 50, // simple offset
            y: e.clientY - rect.top - 50
        });
    };

    return (
        <section className="py-32 bg-[#EEE4FF] min-h-[140vh] flex flex-col justify-end relative overflow-hidden">
            
            <div className="max-w-[90rem] mx-auto text-center relative z-10 w-full px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-20"
                >
                    <h2 className="text-7xl font-extrabold text-black mb-8 leading-tight tracking-tight">
                        Take your creative workflow<br />to the next level
                    </h2>
                    <p className="text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Supercharge your workflow with powerful design tools and effortless
                        collaboration—perfect for freelancers and teams.
                    </p>

                    <div className="flex flex-col items-center gap-8">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#6366f1] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#4f46e5] shadow-xl shadow-indigo-300 transition-all"
                        >
                            Get Started
                        </motion.button>
                        
                        <div className="flex gap-4">
                            <motion.button 
                                whileHover={{ y: -5 }}
                                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-2xl text-gray-700"
                            >
                                {/* Microsoft Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                     <path d="M7.5 1H1v6.5h6.5V1zm0 7.5H1V15h6.5V8.5zm1-7.5h6.5v6.5H8.5V1zm0 7.5h6.5V15H8.5V8.5z" fill="#F25022"/>
                                     <path d="M7.5 1H1v6.5h6.5V1zm0 7.5H1V15h6.5V8.5zm1-7.5h6.5v6.5H8.5V1zm0 7.5h6.5V15H8.5V8.5z" fill="#7FBA00" opacity="0.01"/>
                                      <rect x="0" y="0" width="7" height="7" fill="#F25022"/>
                                      <rect x="8" y="0" width="7" height="7" fill="#7FBA00"/>
                                      <rect x="0" y="8" width="7" height="7" fill="#00A4EF"/>
                                      <rect x="8" y="8" width="7" height="7" fill="#FFB900"/>
                                </svg>
                            </motion.button>
                            <motion.button 
                                whileHover={{ y: -5 }}
                                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-2xl text-black"
                            >
                                {/* Apple Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.418 1.44-1.133 3.475-1.133 3.475s2 0.354 3.449-1.222c1.407-1.494 1.089-3.237 1.009-3.425ZM8.54 4.545c-0.222-0.125-1.238-0.908-2.316-0.908-1.205 0-2.433 0.817-3.15 0.817-0.783 0-2.033-0.85-2.033-0.85s-2.049 2.115-2.049 5.865c0 1.94 0.616 3.966 1.474 5.258 0.833 1.259 2.016 3.033 3.691 2.991 1.466-0.033 2.191-0.991 3.966-0.991 1.766 0 2.375 0.991 3.866 0.95 2.158-0.058 3.55-3.325 3.55-3.325s-2.616-1.042-2.7-4.142c-0.083-2.908 2.366-4.225 3.033-4.577-0.658-2.697-3.666-6.666-3.666-6.666z"/>
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Application Interface Mockup */}
            <div className="w-full max-w-[90rem] mx-auto px-6 h-[800px] mt-10">
                <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden border border-gray-200 h-full flex flex-col">
                    {/* Window Chrome */}
                    <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-400 font-medium">Draftr - Untitled Project</div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                         {/* Left Sidebar */}
                         <div className="w-64 border-r border-gray-100 bg-white p-4 flex flex-col gap-6 text-left relative z-20">
                             <div className="flex items-center gap-4 text-gray-400">
                                 <span className="text-black text-xl">≡</span>
                             </div>
                             
                             <div className="font-bold text-black text-lg mb-2">Layers</div>
                             
                             <div className="space-y-4">
                                 <div>
                                    <div className="flex items-center justify-between text-gray-800 text-sm font-semibold mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <span>▼ Pages</span>
                                        <span>+</span>
                                    </div>
                                    <div className="pl-4 text-gray-500 text-sm space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span>📄</span> Pages 1
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>📄</span> Pages 2
                                        </div>
                                    </div>
                                 </div>
                                 
                                 <div className="pt-4 border-t border-gray-100">
                                     <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                         <span>☐</span> Rectangle
                                     </div>
                                     <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold mb-2">
                                         <span>#</span> Frame
                                     </div>
                                     <div className="pl-6 space-y-3">
                                         <div className="flex items-center gap-2 text-sm text-gray-500">
                                             <span>T</span> Text here
                                         </div>
                                         <div className="flex items-center gap-2 text-sm text-gray-500">
                                             <span>🖼</span> Images
                                         </div>
                                          <div className="flex items-center gap-2 text-sm text-gray-500">
                                             <span>T</span> Text here
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Sidebar Icons vertical */}
                             <div className="absolute left-0 top-20 bottom-0 w-12 bg-white flex flex-col items-center gap-6 py-4 border-r border-gray-100 h-full">
                                    <span className="p-2 rounded hover:bg-black hover:text-white cursor-pointer transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                                    </span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">✎</span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">T</span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">#</span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">☐</span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">🖼</span>
                                    <span className="p-2 text-gray-400 hover:text-black cursor-pointer">Q</span>
                             </div>
                         </div>
                         
                         {/* Main Canvas */}
                         <div className="flex-1 bg-[#F9FAFB] p-12 relative overflow-hidden flex items-center justify-center">
                             
                             {/* Central Design - Purple Card */}
                             <div className="bg-white p-6 shadow-xl rounded-2xl w-[600px] relative">
                                <div className="text-gray-400 text-xs mb-1">Index hero</div>
                                <div className="bg-[#E0E7FF] rounded-xl p-8 h-[400px] relative overflow-hidden shadow-inner flex flex-col">
                                     <div className="absolute top-6 left-8 font-bold text-2xl text-black z-10">Draftr.</div>
                                     <div className="absolute top-6 right-8 text-2xl text-black z-10">≡</div>
                                     
                                     {/* 3D Abstract Shape */}
                                     <div className="flex-1 flex items-center justify-center relative z-0">
                                         <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center bg-gradient-to-br from-[#c4b5fd] to-[#a78bfa]">
                                             <div className="w-64 h-64 bg-purple-400 rounded-full blur-3xl opacity-60 mix-blend-multiply filter absolute top-0 left-0 animate-pulse"></div>
                                             <div className="w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-60 mix-blend-multiply filter absolute bottom-0 right-0 animate-pulse delay-700"></div>
                                         </div>
                                     </div>
                                </div>
                                
                                {/* Mike Cursor */}
                                <div className="absolute top-[30%] left-[-20px] bg-[#6366f1] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg z-20 border-2 border-white">
                                    Mike 
                                    <svg className="w-3 h-3 fill-current rotate-12" viewBox="0 0 24 24"><path d="M21.405 13.922l-8.628-8.628c-1.354-1.354-3.535-1.355-4.891 0L5.342 7.842l6.062 6.061 9.998-10.001L21.405 13.922z"/></svg> 
                                </div>
                             </div>

                             {/* Right Side Floating Elements (simulating variants) */}
                             <div className="absolute top-10 right-20 space-y-4">
                                <span className="text-[#6366f1] text-xs font-bold bg-[#6366f1]/10 px-2 py-1 rounded">Current Variant</span>
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-[#6366f1] border-dashed flex flex-col gap-2 w-48">
                                    <div className="bg-white text-black font-bold py-2 px-4 rounded border border-gray-200 shadow-sm text-sm text-center">Button style</div>
                                    <div className="bg-black text-white font-bold py-2 px-4 rounded text-sm text-center">Button hover</div>
                                    <div className="bg-black text-white font-bold py-2 px-4 rounded ring-2 ring-purple-400 text-sm text-center">Button focus</div>
                                </div>
                             </div>

                             {/* Bottom Floating Card */}
                             <div className="absolute bottom-10 right-20 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                                <div className="w-full h-32 bg-blue-500 rounded-lg mb-4 shadow-inner relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-600"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                                    <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                                </div>
                             </div>

                         </div>
                         
                         {/* Right Sidebar - Properties */}
                         <div className="w-72 border-l border-gray-100 bg-white p-6 flex flex-col gap-8 text-left">
                             <div>
                                 <div className="flex justify-between items-center text-gray-800 font-medium mb-4">
                                     <span>Frame</span>
                                     <span>⌄</span>
                                 </div>
                             </div>
                             
                             {/* Position */}
                             <div>
                                 <h4 className="text-gray-900 font-bold text-sm mb-3">Position</h4>
                                 <div className="flex gap-2 mb-3">
                                     <span className="p-1 text-gray-400 bg-gray-50 rounded">|=</span>
                                     <span className="p-1 text-gray-400">|</span>
                                     <span className="p-1 text-gray-400">=</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">X</span> 226
                                     </div>
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">Y</span> 15
                                     </div>
                                 </div>
                             </div>

                             {/* Layout */}
                             <div>
                                 <h4 className="text-gray-900 font-bold text-sm mb-3">Layout</h4>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">W</span> 226
                                     </div>
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">H</span> 15
                                     </div>
                                 </div>
                             </div>

                             {/* Appearance */}
                             <div>
                                 <h4 className="text-gray-900 font-bold text-sm mb-3">Appearance</h4>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">Op</span> 100%
                                     </div>
                                     <div className="bg-gray-50 rounded p-2 text-xs flex items-center justify-between">
                                         <span className="text-gray-400">R</span> 10
                                     </div>
                                 </div>
                             </div>

                             {/* Fill */}
                             <div>
                                 <h4 className="text-gray-900 font-bold text-sm mb-3">Fill</h4>
                                 <div className="bg-gray-50 p-2 rounded flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
                                        <span className="text-xs text-gray-500">FFFFFF</span>
                                     </div>
                                     <span className="text-xs text-gray-400">100%</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default FinalCTA;
