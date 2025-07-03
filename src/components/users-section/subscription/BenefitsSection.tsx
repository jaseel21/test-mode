// src/components/subscription/BenefitsSection.tsx
import React from 'react';

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
}

const Benefit: React.FC<BenefitProps> = ({ 
  icon, 
  title, 
  description, 
  bgColor, 
  iconBgColor, 
  iconColor 
}) => {
  return (
    <div className={`${bgColor} p-6 rounded-xl text-center hover:shadow-md transition-shadow`}>
      <div className={`w-16 h-16 mx-auto mb-4 ${iconBgColor} rounded-full flex items-center justify-center`}>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Sustainable Impact",
      description: "Recurring donations provide a reliable stream of support, allowing us to plan and implement long-term initiatives.",
      bgColor: "bg-indigo-50",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Easy & Convenient",
      description: "Set up once and your contribution continues to make an impact without requiring further action from you.",
      bgColor: "bg-purple-50",
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Complete Control",
      description: "You maintain complete control over your subscription, with the ability to modify or cancel at any time.",
      bgColor: "bg-indigo-50",
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Set Up a Recurring Donation?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Your consistent support allows us to plan and implement long-term solutions for our community.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Benefit 
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              bgColor={benefit.bgColor}
              iconBgColor={benefit.iconBgColor}
              iconColor={benefit.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};