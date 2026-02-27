import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LogoBar from "./components/LogoBar";
import Toolkit from "./components/Toolkit";
import WorkflowSection from "./components/WorkflowSection";
import Integrations from "./components/Integrations";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import CTASection from "./components/CTASection";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <Toolkit />
      <WorkflowSection />
      <Integrations />
      <Features />
      <Testimonials />
      <Pricing />
      <CTASection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default App;
