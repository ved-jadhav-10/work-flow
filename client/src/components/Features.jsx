import React from "react";

const bigCards = [
  {
    emoji: "☁️",
    title: "Cloud-based accessibility",
    desc: "Access your projects anytime, anywhere—no downloads or installations needed. Your work lives in the cloud.",
  },
  {
    emoji: "⚡",
    title: "Fast & secure performance",
    desc: "Experience lightning-fast speed with enterprise-level security, access control, and version history.",
  },
];

const smallCards = [
  {
    emoji: "✏️",
    title: "Effortless design experience",
    desc: "Intuitive interface and smart AI tools to speed up your creative process.",
  },
  {
    emoji: "🔀",
    title: "Hassle-free prototyping",
    desc: "Transform static designs into interactive prototypes in just a few clicks.",
  },
  {
    emoji: "📤",
    title: "One-click export & handoff",
    desc: "Generate code, export assets, and collaborate with developers effortlessly.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-14">
          Power up your workflow with next-gen features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {bigCards.map((card) => (
            <div
              key={card.title}
              className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500 transition group"
            >
              <div className="text-5xl mb-6">{card.emoji}</div>
              <h3 className="text-white font-bold text-xl mb-3">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {smallCards.map((card) => (
            <div
              key={card.title}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500 transition"
            >
              <div className="text-3xl mb-4">{card.emoji}</div>
              <h3 className="text-white font-bold text-base mb-2">
                {card.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
