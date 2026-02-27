import React from "react";

const steps = [
  {
    num: "01",
    title: "Start your project",
    desc: "Create a new design or import files with just a click. Set up your workspace effortlessly.",
  },
  {
    num: "02",
    title: "Design with ease",
    desc: "Use our intuitive drag and drop editor, smart tools stunning designs.",
  },
  {
    num: "03",
    title: "Export & Share",
    desc: "Easily integrate with your favorite tools to launch your project effortlessly.",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-32 bg-white px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
        {/* Steps */}
        <div className="flex-1">
          <h2 className="text-5xl font-extrabold text-black mb-16 leading-tight">
            Simplify your <br /> workflow
          </h2>
          <div className="flex flex-col gap-14">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-8 items-start">
                <span className="bg-gray-100 text-black font-bold text-lg w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-200 shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-black text-2xl mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock App Screenshot */}
        <div className="flex-1 bg-gray-50 p-12 rounded-[3rem]">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative w-full h-[600px]">
                {/* Window Header */}
                <div className="bg-white px-6 h-14 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Agency / Portfolio</span>
                    <div className="flex gap-[-8px]">
                         <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                         <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-3" />
                         <button className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded ml-3">Share</button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-16 border-r border-gray-100 flex flex-col items-center py-6 gap-6 bg-white shrink-0">
                        <span className="text-black font-bold text-sm">≡</span>
                        <div className="w-10 h-10 bg-black rounded-lg text-white flex items-center justify-center text-sm font-bold shadow-lg">P</div>
                        <span className="text-gray-400 text-sm hover:text-black cursor-pointer">T</span>
                        <span className="text-gray-400 text-sm hover:text-black cursor-pointer">□</span>
                        <span className="text-gray-400 text-sm hover:text-black cursor-pointer">◯</span>
                        <span className="text-gray-400 text-sm hover:text-black cursor-pointer">⊞</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-gray-50 p-10 flex items-center justify-center relative">
                        {/* Mobile App Canvas */}
                        <div className="bg-blue-600 w-72 h-full rounded-3xl shadow-2xl border-4 border-white flex flex-col items-center pt-12 px-6 text-center relative overflow-hidden ring-1 ring-gray-200">
                             <div className="text-white text-left w-full mb-8 opacity-80">
                                 <div className="w-8 h-1 bg-white rounded-full mb-2"></div>
                             </div>
                             <h3 className="text-white font-bold text-2xl text-left w-full mb-8 leading-tight">Welcome back<br/>Mike.</h3>
                             
                             {/* 3D Shape */}
                             <div className="mt-4 w-40 h-40 bg-gradient-to-tr from-yellow-100 to-pink-100 rounded-full shadow-inner flex items-center justify-center relative animate-blob">
                                <div className="absolute inset-4 bg-gradient-to-bl from-purple-400 to-blue-400 rounded-full blur-xl opacity-60"></div>
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-50 via-pink-50 to-yellow-100 flex items-center justify-center transform rotate-45 border-[6px] border-white/20 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full blur-md"></div>
                                </div>
                             </div>
                        </div>

                        {/* Floating Comments */}
                        <div className="absolute top-1/4 right-16 bg-orange-400 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl z-10 animate-bounce border-2 border-white">
                            JJ
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-56 border-l border-gray-100 bg-white p-5 flex flex-col gap-6 shrink-0">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-xs font-bold text-gray-800">Frame 1</span>
                            <span className="text-[10px] text-gray-400">▼</span>
                        </div>
                        
                        <div className="space-y-4">
                             <div className="flex justify-between text-[10px] font-medium text-gray-500">
                                 <span>X <span className="text-gray-900 ml-2">102</span></span>
                                 <span>Y <span className="text-gray-900 ml-2">45</span></span>
                             </div>
                             <div className="flex justify-between text-[10px] font-medium text-gray-500">
                                 <span>W <span className="text-gray-900 ml-2">320</span></span>
                                 <span>H <span className="text-gray-900 ml-2">640</span></span>
                             </div>
                        </div>

                        <div className="bg-gray-100 h-[1px] w-full"></div>

                        <div>
                            <span className="text-xs font-bold block mb-3 text-gray-800">Appearance</span>
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                                <span className="text-[10px] text-gray-600 font-medium">100%</span>
                                <span className="text-[8px] text-gray-400">▼</span>
                            </div>
                        </div>

                         <div>
                            <span className="text-xs font-bold block mb-3 text-gray-800">Fill</span>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-md border border-gray-200 shadow-sm ring-2 ring-gray-50"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-700">#2563EB</span>
                                    <span className="text-[9px] text-gray-400">100%</span>
                                </div>
                            </div>
                        </div>
                         
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold text-gray-500">
                Available on Windows & Mac
                <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs">⊞</span>
                <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs">🍎</span>
            </div>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;
