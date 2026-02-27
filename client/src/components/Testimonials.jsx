import React from "react";
import { motion } from "framer-motion";

const Testimonials = () => {
  return (
    <section className="py-32 bg-white px-8">
      <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row justify-between items-start gap-24">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 max-w-2xl"
        >
            <h2 className="text-7xl font-extrabold text-black leading-tight mb-10">
              Loved by designers & teams
            </h2>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 max-w-2xl"
        >
             {/* Avatars */}
             <div className="flex mb-10">
                 {[1, 5, 8, 3, 12].map((id, i) => (
                    <img 
                        key={i}
                        src={`https://i.pravatar.cc/150?img=${id}`} 
                        alt="Avatar" 
                        className={`w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover ${i > 0 ? '-ml-6' : ''}`} 
                    />
                 ))}
             </div>

             <p className="text-gray-900 text-3xl font-medium leading-relaxed mb-8">
                "This tool has completely transformed how our team collaborates. The real-time editing and seamless integrations make our process so much smoother!"
             </p>
             
             <div className="flex flex-col">
                  <span className="text-xl font-bold text-black">Emily Ray</span>
                  <span className="text-lg text-gray-500 font-medium">UX Designer</span>
             </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
