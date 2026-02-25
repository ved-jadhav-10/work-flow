import React from "react";

const cards = [
  {
    emoji: "🎨",
    title: "Intuitive drag & drop editor",
    desc: "Create stunning designs effortlessly with a user-friendly interface that anyone can master.",
  },
  {
    emoji: "⚡",
    title: "Advanced prototyping",
    desc: "Turn ideas into interactive prototypes without writing a single line of code.",
  },
  {
    emoji: "👥",
    title: "Real-time collaboration",
    desc: "Work seamlessly with your team, give and receive instant feedback from anywhere.",
  },
];

const Toolkit = () => {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-black mb-4">
          The ultimate toolkit for designers & teams
        </h2>
        <p className="text-gray-500 mb-14 max-w-2xl mx-auto">
          Everything you need to create, prototype, and collaborate - all in a
          single, easy-to-use platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-gray-50 rounded-2xl p-6 text-left hover:shadow-md transition border border-gray-100 group"
            >
              <div className="text-4xl mb-4">{card.emoji}</div>
              <h3 className="font-bold text-black text-lg mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Toolkit;
