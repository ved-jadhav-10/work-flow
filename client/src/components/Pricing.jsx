import React, { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    id: 1,
    name: "Starter plan",
    desc: "For individuals & new creators",
    price: 19,
    priceYearly: 15,
    popular: false,
    btnColor: "bg-gray-900 text-white hover:bg-black",
    features: [
      { text: "1 active project", included: true },
      { text: "Basic collaboration tools", included: true },
      { text: "Limited prototyping options", included: true },
      { text: "500MB cloud storage", included: true },
      { text: "Seamless third-party integrations", included: false },
      { text: "Community support", included: false },
    ],
  },
  {
    id: 2,
    name: "Pro plan",
    desc: "For freelancers & small teams",
    price: 49,
    priceYearly: 39,
    popular: true,
    btnColor: "bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-lg shadow-indigo-200",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "Real-time collaboration", included: true },
      { text: "Advanced prototyping tools", included: true },
      { text: "Cloud storage & version history", included: true },
      { text: "Seamless third-party integrations", included: true },
      { text: "Email & chat support", included: false },
    ],
  },
  {
    id: 3,
    name: "Business plan",
    desc: "For growing teams & agencies",
    price: 79,
    priceYearly: 63,
    popular: false,
    btnColor: "bg-gray-900 text-white hover:bg-black",
    features: [
      { text: "Everything in Pro +", included: true },
      { text: "Team management & permissions", included: true },
      { text: "Enhanced security controls", included: true },
      { text: "Priority integrations & API access", included: true },
      { text: "Advanced cloud storage", included: true },
      { text: "24/7 priority support", included: true },
    ],
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-40 bg-white px-8">
      <div className="max-w-[90rem] mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
        >
            <h2 className="text-7xl font-extrabold text-black mb-8">
              Flexible pricing plans
            </h2>
            <p className="text-gray-500 mb-16 max-w-2xl mx-auto text-2xl">
              Choose a plan that grows with you. Start for free and upgrade anytime
              for more features and support.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-6 mb-24">
              <span className={`text-lg font-medium ${!isYearly ? "text-black" : "text-gray-400"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-16 h-9 bg-gray-200 rounded-full relative transition-colors focus:outline-none"
              >
                  <motion.div 
                    initial={false}
                    animate={{ x: isYearly ? 28 : 4 }}
                    className={`absolute top-1 w-7 h-7 bg-[#6366f1] rounded-full shadow-sm`}
                  />
              </button>
              <div className="flex items-center gap-2">
                  <span className={`text-lg font-medium ${isYearly ? "text-black" : "text-gray-400"}`}>
                    Yearly
                  </span>
                  <span className="text-[#6366f1] font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">
                    20% off
                  </span>
              </div>
            </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {plans.map((plan, i) => (
                <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -15, transition: { duration: 0.2 } }}
                    viewport={{ once: true }}
                    className={`rounded-[2.5rem] p-3 border ${plan.popular ? 'border-[#6366f1]' : 'border-gray-200'} bg-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
                >
                    {/* Shadow Effect for Pro Plan */}
                    {plan.popular && (
                         <div className="absolute top-0 inset-x-0 h-3 bg-[#6366f1]" />
                    )}

                    <div className="p-10 pb-2 text-left bg-white rounded-t-[2.2rem]">
                        <h3 className="text-3xl font-bold text-black mb-2">{plan.name}</h3>
                        <p className="text-lg text-gray-500 mb-8">{plan.desc}</p>
                        
                        <div className="flex items-baseline gap-1 mb-10">
                            <span className="text-7xl font-bold text-black">${isYearly ? plan.priceYearly : plan.price}</span>
                            <span className="text-gray-500 text-lg">/month</span>
                        </div>

                        <button className={`w-full py-4 rounded-full font-bold text-lg mb-10 transition-transform transform active:scale-95 ${plan.btnColor}`}>
                            Get Started
                        </button>
                    </div>

                    <div className="bg-gray-50 p-10 rounded-[2.2rem] text-left">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Included features:</p>
                        <ul className="space-y-4">
                            {plan.features.map((feat, k) => (
                                <li key={k} className={`text-lg flex items-start gap-4 ${feat.included ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${feat.included ? 'bg-black' : 'bg-gray-300'}`} />
                                    {feat.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
