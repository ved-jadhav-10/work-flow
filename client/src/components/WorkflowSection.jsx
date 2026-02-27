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
      <section className="py-40 bg-white px-8">
        <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center gap-32">
          {/* Steps */}
          <div className="flex-1">
            <h2 className="text-7xl font-extrabold text-black mb-20 leading-[1.1] tracking-tight">
              Simplify your <br /> workflow
            </h2>
            <div className="flex flex-col gap-20">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-10 items-start">
                  <span className="bg-gray-100 text-black font-bold text-2xl w-20 h-20 flex items-center justify-center rounded-3xl border border-gray-200 shrink-0 shadow-sm">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-bold text-black text-4xl mb-6">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-2xl leading-relaxed max-w-xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Mock App Screenshot */}
          <div className="flex-1 bg-gray-50 p-20 rounded-[4rem] self-stretch flex items-center justify-center min-h-[800px] relative overflow-hidden shadow-inner">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
               {/* App Interface Mockup */}
               <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition duration-500">
                  {/* Header */}
                  <div className="h-16 border-b border-gray-100 flex items-center px-6 gap-4 bg-white">
                      <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-400"></div>
                          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                          <div className="w-4 h-4 rounded-full bg-green-400"></div>
                      </div>
                  </div>
                  {/* Body */}
                  <div className="p-8 flex flex-col gap-6 bg-gray-50 h-[600px]">
                      <div className="flex gap-6">
                          <div className="w-1/3 h-40 bg-white rounded-2xl shadow-sm animate-pulse"></div>
                          <div className="w-2/3 h-40 bg-white rounded-2xl shadow-sm">
                              <div className="h-full w-full bg-blue-50 rounded-2xl flex items-center justify-center">
                                  <span className="text-6xl">📊</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
                          <div className="absolute top-10 left-10 right-10 bottom-10 border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                               <div className="text-center">
                                  <div className="text-6xl mb-4">🖼️</div>
                                  <div className="text-gray-400 text-xl font-bold">Drag files here</div>
                               </div>
                          </div>
                          
                          {/* Floating elements */}
                          <div className="absolute top-20 right-20 bg-black text-white px-6 py-3 rounded-xl shadow-lg font-bold">
                              Processing...
                          </div>
                      </div>
                  </div>
               </div>
          </div>
        </div>
      </section>
    );
  };

export default WorkflowSection;
