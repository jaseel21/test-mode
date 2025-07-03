// src/components/users-section/Institute.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

const Institute: React.FC = () => {
  const [form, setForm] = useState({ 
    fullName: "", 
    phoneNumber: "", 
    location: "",
    email: "",
    amount: 0,
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  
  const videos = [
    { id: 1, title: "Campus Tour", url: "https://www.youtube.com/embed/sample1", thumbnail: "/api/placeholder/480/270" },
    { id: 2, title: "Student Life", url: "https://www.youtube.com/embed/sample2", thumbnail: "/api/placeholder/480/270" },
  ];
  
  const galleryImages = [
    { id: 1, title: "Main Building", src: "/api/placeholder/400/300" },
    { id: 2, title: "Library", src: "/api/placeholder/400/300" },
    { id: 3, title: "Classroom", src: "/api/placeholder/400/300" },
    { id: 4, title: "Cafeteria", src: "/api/placeholder/400/300" },
  ];
  
  const instituteFacts = [
    { label: "Established", value: "1995" },
    { label: "Students", value: "1,200+" },
    { label: "Teachers", value: "85" },
    { label: "Campus Size", value: "5 Acres" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(form);
      setShowThankYou(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowThankYou(false);
        setForm({ fullName: "", phoneNumber: "", location: "", email: "", amount: 0, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error processing donation:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 px-5 bg-purple-100 rounded-full text-purple-800 font-medium text-sm mb-3">
            Education Excellence
          </div>
          <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">Our Institute</h2>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Help support our educational institute that&apos;s transforming lives through quality education and values.</p>
        </motion.div>
        
        {/* Thank You Modal */}
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Support!</h3>
              <p className="text-gray-600 mb-6">Your donation to our institute will help us continue providing quality education.</p>
              <button 
                onClick={() => setShowThankYou(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Institute Info Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Tabs Navigation */}
            <div className="flex border-b border-indigo-200 mb-6">
              <button 
                className={`py-3 px-5 font-medium text-lg ${
                  activeTab === 'about' 
                    ? 'text-indigo-800 border-b-2 border-indigo-600' 
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button 
                className={`py-3 px-5 font-medium text-lg ${
                  activeTab === 'videos' 
                    ? 'text-indigo-800 border-b-2 border-indigo-600' 
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </button>
              <button 
                className={`py-3 px-5 font-medium text-lg ${
                  activeTab === 'gallery' 
                    ? 'text-indigo-800 border-b-2 border-indigo-600' 
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('gallery')}
              >
                Gallery
              </button>
            </div>
            
            {/* About Tab Content */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6">
                  <Image 
                    src="/api/placeholder/800/400" 
                    alt="Institute Building"
                    className="object-cover"
                    fill
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">Excellence in Education</h3>
                
                <p className="text-gray-600 mb-4">
                  Our institute has been a beacon of educational excellence since its establishment. We provide quality education to students from all backgrounds, fostering an environment of learning, growth, and character development.
                </p>
                
                <p className="text-gray-600 mb-6">
                  With dedicated teachers, modern facilities, and a comprehensive curriculum, we prepare students not just academically but also instill values and skills needed for life. Your support helps us continue this important mission.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {instituteFacts.map((fact, index) => (
                    <div key={index} className="bg-indigo-50 p-4 rounded-xl text-center">
                      <h4 className="text-2xl font-bold text-indigo-800">{fact.value}</h4>
                      <p className="text-indigo-600">{fact.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Videos Tab Content */}
            {activeTab === 'videos' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                variants={containerVariants}
                className="space-y-6"
              >
                {videos.map((video) => (
                  <motion.div 
                    key={video.id} 
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="relative aspect-video">
                      <Image 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="object-cover"
                        fill
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-indigo-900">{video.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Gallery Tab Content */}
            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                variants={containerVariants}
              >
                {galleryImages.map((image) => (
                  <motion.div 
                    key={image.id} 
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="relative h-48 w-full">
                      <Image 
                        src={image.src} 
                        alt={image.title}
                        className="object-cover"
                        fill
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-indigo-800">{image.title}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
          
          {/* Donation Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6">Support Our Institute</h3>
              
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Donation Amount"
                    className="w-full p-3 pl-8 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    required
                    min="1"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">₹</span>
                </div>
                
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                />
                
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                
                <input
                  type="text"
                  placeholder="Location (District, Panchayat)"
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
                
                <textarea
                  placeholder="Your Message (Optional)"
                  rows={3}
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                ></textarea>
              </div>
              
              <motion.button
                type="submit"
                disabled={isLoading || !form.amount || !form.fullName || !form.phoneNumber || !form.location}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Donate to Institute"
                }
              </motion.button>
              
              <div className="mt-4">
                <p className="text-sm text-center text-gray-500">
                  Your contribution may qualify for tax benefits under applicable laws.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Institute;