import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
          Terms and Conditions
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Effective Date: March 24, 2025
        </p>

        {/* Introduction */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to AIC Amal, the official donation platform of Akode Islamic Centre. By accessing or using our website or mobile application, you agree to comply with and be bound by the following Terms and Conditions. Please review them carefully.
          </p>
        </section>

        {/* Terms Sections */}
        <section className="space-y-6">
          {/* Eligibility */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed">
              To use our platform, you must be at least 18 years of age or have explicit parental or guardian consent. By accessing AIC Amal, you confirm that you meet these requirements.
            </p>
          </div>

          {/* Use of Platform */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Platform</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are permitted to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed mb-4">
              <li>Make donations to general or specific charitable causes.</li>
              <li>Participate in campaign features, such as the Dates Challenge.</li>
              <li>Receive notifications and updates related to your contributions.</li>
              <li>Share donation receipts and social media frames provided by the platform.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You are prohibited from:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
              <li>Engaging in any unlawful activities on the platform.</li>
              <li>Providing false or misleading information during registration or donation processes.</li>
            </ul>
          </div>

          {/* Donation Policy */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Donation Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              All donations made through AIC Amal are voluntary and non-refunded. You may contribute via Quick Pay, general donations, or specific campaigns. For your convenience, you can enable Auto Pay to set up recurring donations.
            </p>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content, including text, images, logos, and designs on the AIC Amal platform, is the exclusive property of Akode Islamic Centre. Unauthorized use, reproduction, or distribution of this content is strictly prohibited.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Any updates will be effective upon posting to the platform. Your continued use of AIC Amal following such changes constitutes your acceptance of the revised terms.
            </p>
          </div>
        </section>

        {/* Closing Note */}
        <section className="mt-6 text-center">
          <p className="text-gray-600">
            Thank you for supporting Akode Islamic Centre’s mission through AIC Amal. If you have any questions about these Terms and Conditions, please contact us.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsAndConditions;