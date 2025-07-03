"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Import components
import { PageHeader } from "@/components/users-section/sponsorship/PageHeader";
import { ThankYouModal } from "@/components/users-section/sponsorship/ThankYouModal";
import { SponsorshipForm } from "@/components/users-section/sponsorship/SponsorshipForm";
import { SponsorshipSelector } from "@/components/users-section/sponsorship/SponsorshipSelector";

// Import data
import { sponsorshipData } from "@/components/users-section/types";

export default function SponsorshipPage() {
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeOption, setActiveOption] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSponsor = (type, option, withEducation = false) => {
    const finalAmount = withEducation && option.withEducation ? option.withEducation : option.amount;
    
    setActiveProgram(type);
    
    // Create an object for the active option
    const activeOpt = {
      ...option,
      finalAmount,
      includesEducation: withEducation,
    };
    
    setActiveOption(activeOpt);
  };

  const handleBackToSelection = () => {
    setActiveProgram(null);
    setActiveOption(null);
  };

  const handleSubmitSuccess = () => {
    setShowThankYou(true);
    
    // Reset form after delay
    setTimeout(() => {
      setShowThankYou(false);
      setActiveProgram(null);
      setActiveOption(null);
    }, 3000);
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  return (
    <>
      {/* Page Header Component */}
      <PageHeader 
        title="Sponsorship Programs" 
        description="Provide sustained support through our sponsorship programs. Your regular contributions create stability and lasting change."
      />

      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          {/* Thank You Modal Component */}
          <AnimatePresence>
            <ThankYouModal 
              show={showThankYou} 
              onClose={handleCloseThankYou} 
            />
          </AnimatePresence>
          
          {/* Conditional Rendering based on selection state */}
          {activeProgram && activeOption ? (
            <SponsorshipForm
              activeProgram={activeProgram}
              activeOption={activeOption}
              onBack={handleBackToSelection}
              onSubmitSuccess={handleSubmitSuccess}
            />
          ) : (
            <SponsorshipSelector 
              sponsorships={sponsorshipData}
              onSelect={handleSponsor}
            />
          )}
        </div>
      </section>
    </>
  );
}