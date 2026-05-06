import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaEnvelope, FaMapMarkedAlt, FaInstagram, FaLinkedin, FaGithub, FaTwitter, FaPlus } from "react-icons/fa";

const faqs = [
  {
    question: "How do I find events near me?",
    answer:
      "Go to the Explore page. Allow location access and the map will show nearby events automatically.",
  },
  {
    question: "How can I create an event?",
    answer:
      "Click on 'Create Event' in the navbar, fill the form, upload banner, and publish.",
  },
  {
    question: "How does booking work?",
    answer:
      "Open an event → click Attend → confirm your spot. Seats are limited.",
  },
  {
    question: "Can I cancel my attendance?",
    answer:
      "Yes, go to the event page and click 'Cancel Attendance'.",
  },
  {
    question: "Why can’t I see events?",
    answer:
      "Check filters, zoom level, or enable location permissions.",
  },
];

const HelpPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-gray-300 mt-2">
            Everything you need to know about using the platform
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-purple-700 hover:bg-purple-800 transition p-4 rounded-xl flex flex-col items-center gap-2">
            <FaMapMarkedAlt />
            Explore Events
          </button>

          <button className="bg-purple-700 hover:bg-purple-800 transition p-4 rounded-xl flex flex-col items-center gap-2">
            <FaPlus />
            Create Event
          </button>

          <button className="bg-purple-700 hover:bg-purple-800 transition p-4 rounded-xl flex flex-col items-center gap-2">
            My Bookings
          </button>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span>{faq.question}</span>
                  <FaChevronDown
                    className={`transition ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-gray-300 text-sm"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-slate-800 p-6 rounded-xl text-center space-y-3">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="text-gray-300 text-sm">
            Reach out to our support team anytime.
          </p>

          <button className="bg-purple-700 hover:bg-purple-800 px-6 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto">
            <FaEnvelope />
            Contact Support
          </button>
        </div>
        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-4 text-xl">
          <h5>Reach us on for any questions:</h5>
          <a href="https://instagram.com/adeshsinghsomwanshi" target="_blank" rel="noreferrer" className="hover:text-pink-500">
            <FaInstagram />
          </a>

          <a href="https://linkedin.com/in/adesh-singh-084788287/" target="_blank" rel="noreferrer" className="hover:text-blue-400">
            <FaLinkedin />
          </a>

          <a href="https://github.com/adeshsinghbits" target="_blank" rel="noreferrer" className="hover:text-gray-400">
            <FaGithub />
          </a>

          <a href="https://twitter.com/adeshsinghsomwanshi" target="_blank" rel="noreferrer" className="hover:text-sky-400">
            <FaTwitter />
          </a>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;