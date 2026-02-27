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
    <section className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Steps */}
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-black mb-12 leading-tight">
            Simplify your <br /> workflow
          </h2>
          <div className="flex flex-col gap-10">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <span className="bg-gray-100 text-black font-bold text-sm w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-black text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock App Screenshot */}
        <div className="flex-1 bg-gray-50 p-8 rounded-3xl">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative w-full h-[400px]">
                {/* Window Header */}
                <div className="bg-white px-4 h-10 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Agency / Portfolio</span>
                    <div className="flex gap-2">
                         <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" className="w-5 h-5 rounded-full border border-white shadow-sm" />
                         <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-5 h-5 rounded-full border border-white shadow-sm -ml-3" />
                         <button className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Share</button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-10 border-r border-gray-100 flex flex-col items-center py-3 gap-4 bg-white">
                        <span className="text-black font-bold text-xs">≡</span>
                        <div className="w-6 h-6 bg-black rounded text-white flex items-center justify-center text-[10px]">P</div>
                        <span className="text-gray-400 text-[10px]">T</span>
                        <span className="text-gray-400 text-[10px]">□</span>
                        <span className="text-gray-400 text-[10px]">◯</span>
                        <span className="text-gray-400 text-[10px]">⊞</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center relative">
                        {/* Mobile App Canvas */}
                        <div className="bg-blue-600 w-48 h-full rounded-xl shadow-lg border-4 border-white flex flex-col items-center pt-8 px-4 text-center relatives overflow-hidden">
                             <div className="text-white text-left w-full mb-4">
                                 <div className="w-4 h-0.5 bg-white/50 mb-1"></div>
                                 <div className="w-3 h-0.5 bg-white/50"></div>
                             </div>
                             <h3 className="text-white font-bold text-sm text-left w-full mb-1">Welcome back<br/>Mike.</h3>
                             
                             {/* 3D Shape */}
                             <div className="mt-4 w-24 h-24 bg-gradient-to-tr from-yellow-200 to-pink-200 rounded-full shadow-inner flex items-center justify-center relative">
                                <div className="absolute inset-2 bg-gradient-to-bl from-purple-400 to-blue-400 rounded-full blur-md opacity-70"></div>
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 via-pink-100 to-yellow-200 flex items-center justify-center transform rotate-45 border-4 border-white/20">
                                    <div className="w-8 h-8 bg-black/10 rounded-full blur-sm"></div>
                                </div>
                             </div>
                        </div>

                        {/* Floating Comments */}
                        <div className="absolute top-1/4 right-8 bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-bounce">
                            JJ
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-32 border-l border-gray-100 bg-white p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold">Frame 1</span>
                            <span className="text-[8px] text-gray-400">▼</span>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="flex justify-between text-[8px] text-gray-500">
                                 <span>X <span className="text-gray-800">102</span></span>
                                 <span>Y <span className="text-gray-800">45</span></span>
                             </div>
                             <div className="flex justify-between text-[8px] text-gray-500">
                                 <span>W <span className="text-gray-800">320</span></span>
                                 <span>H <span className="text-gray-800">640</span></span>
                             </div>
                        </div>

                        <div className="bg-gray-100 h-[1px] w-full my-1"></div>

                        <div>
                            <span className="text-[10px] font-bold block mb-1">Appearance</span>
                            <div className="flex items-center justify-between bg-gray-50 p-1 rounded border border-gray-100">
                                <span className="text-[8px] text-gray-500">100%</span>
                                <span className="text-[8px] text-gray-400">▼</span>
                            </div>
                        </div>

                         <div>
                            <span className="text-[10px] font-bold block mb-1">Fill</span>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 bg-blue-600 rounded-sm border border-gray-200"></div>
                                <span className="text-[8px] text-gray-500">#2563EB</span>
                                <span className="text-[8px] text-gray-400 ml-auto">100%</span>
                            </div>
                        </div>
                         
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
                Available on Windows & Mac
                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded">⊞</span>
                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded">🍎</span>
            </div>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;
