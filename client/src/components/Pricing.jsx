import React, { useState, useEffect } from "react";
import axios from "axios";

const fallbackPlans = [
  {
    id: 1,
    name: "Starter Plan",
    desc: "For individuals & new creators",
    monthly: 19,
    yearly: 15,
    popular: false,
    features: ["5 Projects", "Basic AI Tools", "2GB Storage", "Email Support"],
  },
  {
    id: 2,
    name: "Pro Plan",
    desc: "For freelancers & small teams",
    monthly: 49,
    yearly: 39,
    popular: true,
    features: [
      "Unlimited Projects",
      "Advanced AI Tools",
      "20GB Storage",
      "Priority Support",
    ],
  },
  {
    id: 3,
    name: "Business Plan",
    desc: "For growing teams & agencies",
    monthly: 79,
    yearly: 63,
    popular: false,
    features: [
      "Unlimited Everything",
      "Custom AI Models",
      "100GB Storage",
      "24/7 Dedicated Support",
    ],
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState(fallbackPlans);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/pricing/plans")
      .then((res) => setPlans(res.data.data))
      .catch(() => setPlans(fallbackPlans));
  }, []);

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-black mb-4">
          Flexible pricing plans
        </h2>
        <p className="text-gray-500 mb-10 max-w-xl mx-auto">
          Choose a plan that grows with you. Start for free and upgrade anytime
          for more features and support.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className={`text-sm font-medium ${
              !isYearly ? "text-black" : "text-gray-400"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isYearly ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${
                isYearly ? "left-7" : "left-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isYearly ? "text-black" : "text-gray-400"
            }`}
          >
            Yearly{" "}
            <span className="text-purple-600 font-bold text-xs bg-purple-50 px-2 py-0.5 rounded-full">
              20% off
            </span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 text-left border transition hover:shadow-xl ${
                plan.popular
                  ? "border-purple-500 bg-purple-50 shadow-lg md:scale-105"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.popular && (
                <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-black text-lg">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
              <div className="text-4xl font-extrabold text-black mb-6">
                ${isYearly ? plan.yearly : plan.monthly}
                <span className="text-base font-normal text-gray-400">
                  /month
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-semibold text-sm transition ${
                  plan.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
