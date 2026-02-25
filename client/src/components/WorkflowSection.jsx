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
    desc: "Use our intuitive drag-and-drop editor and smart AI tools to create stunning designs faster.",
  },
  {
    num: "03",
    title: "Export & Share",
    desc: "Easily integrate with your favorite tools to launch your project effortlessly.",
  },
];

const WorkflowSection = () => {
  return (
    <section className="py-24 bg-gray-50 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Steps */}
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-black mb-10">
            Simplify your workflow
          </h2>
          <div className="flex flex-col gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 items-start">
                <span className="text-gray-300 font-bold text-xl w-10 shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-black text-base mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock App Screenshot */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-white px-4 py-3 flex items-center gap-2 border-b border-gray-100">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-gray-400">Agency / Portfolio</span>
          </div>
          <div className="flex">
            <div className="w-10 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-3">
              {["☰", "✎", "◻", "T", "⊞", "◎"].map((icon, k) => (
                <span key={k} className="text-gray-300 text-xs">
                  {icon}
                </span>
              ))}
            </div>
            <div className="flex-1 p-4">
              <div className="bg-blue-500 rounded-xl p-4 mb-3">
                <p className="text-white text-xs font-bold">
                  Welcome back, Mike.
                </p>
                <p className="text-blue-100 text-xs mt-1">
                  Your projects are ready.
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl h-20 flex items-center justify-center mb-3">
                <span className="text-3xl">🍩</span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>🖥</span> Available on Windows & Mac
              </div>
            </div>
            <div className="w-28 border-l border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">
                Appearance
              </p>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-2 bg-gray-200 rounded mb-1.5" />
              ))}
              <p className="text-xs text-gray-400 mt-3 mb-2 font-medium">
                Colors
              </p>
              <div className="flex gap-1 flex-wrap">
                {[
                  "bg-purple-400",
                  "bg-blue-400",
                  "bg-pink-400",
                  "bg-green-400",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
