"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/users-section/campaigns/Header";
import { CampaignCounter } from "@/components/users-section/campaigns/CampaignCounter";
import { ThankYouModal } from "@/components/users-section/campaigns/ThankYouModal";
import { CampaignCard } from "@/components/users-section/campaigns/CampaignCard";
import { ContributionForm } from "@/components/users-section/campaigns/ContributionForm";
import { FooterInfo } from "@/components/users-section/campaigns/FooterInfo";
import { getPlaceholderImageUrl } from "@/lib/utils";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    email: "",
    amount: 0,
    unit: "",
    quantity: 0,
    count: 1,
  });
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/campaigns/published", {
          method: "GET",
          headers: {
            "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        console.log("Fetched campaigns:", data);

        setCampaigns(
          data.map((campaign) => {
            // Simply use the featuredImageUrl from Supabase or fallback to placeholder
            const imageUrl = campaign.featuredImageUrl || getPlaceholderImageUrl(800, 400);

            return {
              id: campaign._id,
              title: campaign.name,
              description: campaign.description,
              raised: campaign.currentAmount,
              goal: campaign.goal,
              endDate: campaign.endDate,
              type: campaign.type,
              image: imageUrl,
              featuredImageUrl: campaign.featuredImageUrl,
              isInfinite: campaign.isInfinite,
              area: campaign.area,
              rate: campaign.rate,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        // Fallback data remains commented out to avoid overriding API data
        /*
        setCampaigns([
          {
            id: "1",
            title: "Ramadan Fundraiser",
            description: "Help families during Ramadan.",
            raised: 5000,
            goal: 10000,
            endDate: "2025-04-01",
            type: "fundraising",
            image: "/api/placeholder/800/400",
            isInfinite: true,
          },
          {
            id: "2",
            title: "Coconut Drive",
            description: "Collect coconuts for ceremonies.",
            raised: 320,
            goal: 1000,
            endDate: "2025-04-01",
            type: "physical",
            image: "/api/placeholder/800/400",
            isInfinite: false,
          },
          {
            id: "3",
            title: "School Fixed Fund",
            description: "Support school supplies.",
            raised: 12500,
            goal: 25000,
            endDate: "2025-05-15",
            type: "fixedamount",
            image: "/api/placeholder/800/400",
            isInfinite: false,
            area: "3 square feet",
            rate: 3000,
          },
        ]);
        */
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phoneNumber.replace(/[-\s]/g, "")))
      errors.phoneNumber = "Please enter a valid 10-digit phone number";
    if (!form.location.trim()) errors.location = "Location is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Please enter a valid email";

    const activeCampaignData = campaigns.find((c) => c.id === activeCampaign);
    if (
      activeCampaignData?.type === "fundraising" &&
      (!form.amount || form.amount <= 0)
    ) {
      errors.amount = "Please enter a valid amount";
    } else if (activeCampaignData?.type === "physical") {
      if (!form.unit) errors.unit = "Please select a unit";
      if (!form.quantity || form.quantity <= 0)
        errors.quantity = "Please enter a valid quantity";
    } else if (
      activeCampaignData?.type === "fixedamount" &&
      (!form.count || form.count <= 0)
    ) {
      errors.count = "Please select at least one unit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (campaignId, type) => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const activeCampaignData = campaigns.find((c) => c.id === campaignId);
      const contributionData = {
        campaignId,
        type,
        ...form,
        amount:
          type === "fixedamount" &&
          activeCampaignData &&
          activeCampaignData.rate !== undefined
            ? activeCampaignData.rate * form.count
            : form.amount,
      };
      console.log("Submitting contribution:", contributionData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Uncomment to enable thank you modal
      // setShowThankYou(true);
      setTimeout(() => {
        // setShowThankYou(false);
        setActiveCampaign(null);
        setForm({
          fullName: "",
          phoneNumber: "",
          location: "",
          email: "",
          amount: 0,
          unit: "",
          quantity: 0,
          count: 1,
        });
        setFormErrors({});
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <>
      <Header />
      <section className="pt-48 pb-16 px-6 min-h-screen mt-12">
        <div className="container mx-auto max-w-6xl">
          <CampaignCounter count={campaigns.length} />
          <ThankYouModal show={showThankYou} onClose={() => setShowThankYou(false)} />

          {isLoading && campaigns.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          )}

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {campaigns.map((campaign) => (
              <div key={campaign.id}>
                <CampaignCard
                  campaign={campaign}
                  isActive={activeCampaign === campaign.id}
                  onClick={(id) => setActiveCampaign(id.toString())}
                />
                {activeCampaign === campaign.id && (
                  <ContributionForm
                    campaign={campaign}
                    form={form}
                    formErrors={formErrors}
                    setCampaigns={setCampaigns}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setActiveCampaign(null);
                      setFormErrors({});
                    }}
                    onFormChange={setForm}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {!isLoading && campaigns.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Campaigns</h3>
              <p className="text-gray-500">Check back soon for new opportunities.</p>
            </div>
          )}

          <FooterInfo />
        </div>
      </section>
    </>
  );
}