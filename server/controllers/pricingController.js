const getPlans = (req, res) => {
  const plans = [
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
  res.json({ success: true, data: plans });
};

module.exports = { getPlans };
