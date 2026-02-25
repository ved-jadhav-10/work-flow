import React from "react";

const testimonials = [
  {
    quote:
      "Before Cognify AI, we juggled five different tools to manage clients, tasks, and reports. Now it's all in one place. We launched 3 campaigns faster this quarter than ever before.",
    name: "Sofia Delgado",
    role: "Product Manager, NovaTech",
    avatar: "S",
    color: "bg-purple-200",
  },
  {
    quote:
      "Cognify AI completely transformed how our design team collaborates. The real-time features are incredible and the AI suggestions save us hours every week.",
    name: "Marcus Chen",
    role: "Lead Designer, Pixel Studio",
    avatar: "M",
    color: "bg-blue-200",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-16 mb-16">
          <div className="flex-1">
            <h2 className="text-4xl font-extrabold text-black leading-tight">
              Loved by designers & teams
            </h2>
            <div className="flex mt-6">
              {["🧑", "👩", "👨", "👩", "👦"].map((a, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full bg-purple-${
                    100 + i * 100
                  } border-2 border-white flex items-center justify-center text-lg ${
                    i > 0 ? "-ml-2" : ""
                  }`}
                >
                  {a}
                </div>
              ))}
              <span className="ml-3 text-sm text-gray-500 self-center">
                +2,400 happy users
              </span>
            </div>
          </div>
          <div className="flex-1 text-gray-500 text-sm leading-relaxed">
            Join thousands of designers, developers, and product teams who have
            supercharged their workflow with Cognify AI.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
            >
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-gray-700`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
