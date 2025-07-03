import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CampaignListing = () => {
  const [campaigns] = useState([]);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", location: "", email: "", amount: 0 });
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    // Mock API call - replace with actual fetch in production
    const fetchCampaigns = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // setCampaigns([
      //   { 
      //     id: 1, 
      //     title: "Ramadan Date Challenge", 
      //     description: "Help us provide dates to families in need during the holy month of Ramadan. Your contribution ensures families have nutritious dates to break their fast.", 
      //     raised: 5000, 
      //     goal: 10000, 
      //     endDate: "2025-04-01", 
      //     type: "fund",
      //     image: "/images/campaign-dates.jpg" // Replace with actual image path
      //   },
      //   { 
      //     id: 2, 
      //     title: "Coconut Collection Drive", 
      //     description: "Join our effort to collect coconuts for community religious ceremonies and celebrations. A physical donation that makes a direct impact!", 
      //     raised: 320, 
      //     goal: 1000, 
      //     endDate: "2025-04-01", 
      //     type: "physical",
      //     image: "/images/campaign-coconut.jpg" // Replace with actual image path
      //   },
      //   { 
      //     id: 3, 
      //     title: "School Supplies for Children", 
      //     description: "Help provide essential school supplies to underprivileged children. Your donation gives them the tools they need for education.", 
      //     raised: 12500, 
      //     goal: 25000, 
      //     endDate: "2025-05-15", 
      //     type: "fund",
      //     image: "/images/campaign-school.jpg" // Replace with actual image path
      //   },
      //   { 
      //     id: 4, 
      //     title: "Community Center Renovation", 
      //     description: "Support the renovation of our community center which provides valuable services to the local population.", 
      //     raised: 75000, 
      //     goal: 150000, 
      //     endDate: "2025-06-30", 
      //     type: "fund",
      //     image: "/images/campaign-center.jpg" // Replace with actual image path
      //   },
      // ]);
    };
    
    fetchCampaigns();
  }, []);

  const handleSubmit = async (campaignId, type) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log({ campaignId, type, ...form });
      setShowThankYou(true);
      
      // Reset form and active campaign after a delay
      setTimeout(() => {
        setShowThankYou(false);
        setActiveCampaign(null);
        setForm({ fullName: "", phoneNumber: "", location: "", email: "", amount: 0 });
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
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
    <section className="py-24 px-6 bg-gradient-to-r from-purple-50 to-indigo-50">
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
            Join Our Campaigns
          </div>
          <h2 className="text-5xl font-extrabold text-indigo-900 mb-4">Current Campaigns</h2>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">Support our specific initiatives and help us reach our goals. Every contribution makes a difference.</p>
        </motion.div>
        
        {/* Thank You Popup */}
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">Your contribution to our campaign has been received. Together, we're making a difference!</p>
              <button 
                onClick={() => setShowThankYou(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Campaign Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {campaigns.map((campaign) => (
            <motion.div 
              key={campaign.id} 
              variants={itemVariants}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                activeCampaign === campaign.id ? 'ring-4 ring-indigo-500' : ''
              }`}
            >
              {/* Campaign Image */}
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-indigo-900/20"></div>
                <Image 
                  src={campaign.image || "/api/placeholder/800/400"} 
                  alt={campaign.title}
                  className="object-cover"
                  fill
                />
                {campaign.type === "fund" && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="h-2 bg-gray-200 rounded-full mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        className="h-2 bg-indigo-600 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-indigo-800">₹{campaign.raised.toLocaleString()}</span>
                      <span className="text-gray-500">₹{campaign.goal.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {campaign.type === "physical" && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="h-2 bg-gray-200 rounded-full mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        className="h-2 bg-purple-600 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-purple-800">{campaign.raised.toLocaleString()} items</span>
                      <span className="text-gray-500">{campaign.goal.toLocaleString()} goal</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Campaign Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold text-indigo-900">{campaign.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.type === 'fund' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {campaign.type === 'fund' ? 'Fundraising' : 'Collection'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{campaign.description}</p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Ends: {new Date(campaign.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-indigo-600">
                    {Math.round((campaign.raised / campaign.goal) * 100)}% Complete
                  </div>
                </div>
                
                {activeCampaign === campaign.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(campaign.id, campaign.type);
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
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
                    
                    {campaign.type === 'fund' && (
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
                    )}
                    
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setActiveCampaign(null)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : campaign.type === 'fund' ? "Donate" : "Submit"
                        }
                      </button>
                    </div>
                  </form>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCampaign(campaign.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                      campaign.type === 'fund'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {campaign.type === 'fund' ? "Donate Now" : "Participate"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CampaignListing;