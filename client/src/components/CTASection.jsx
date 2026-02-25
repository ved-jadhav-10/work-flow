import React from "react";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-purple-100 to-purple-200 px-6 text-center">
      <p className="text-gray-500 text-sm mb-2 font-medium">
        Take your creative workflow
      </p>
      <h2 className="text-5xl font-extrabold text-black mb-4">
        to the next level
      </h2>
      <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm leading-relaxed">
        Supercharge your workflow with powerful AI tools and effortless
        collaboration—perfect for freelancers and teams of all sizes.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition shadow-lg">
          Get Started
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow hover:shadow-md transition text-lg">
            🪟
          </button>
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow hover:shadow-md transition text-lg">
            🍎
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-xs mt-4">
        Available on Windows & macOS — Free to start
      </p>
    </section>
  );
};

export default CTASection;
