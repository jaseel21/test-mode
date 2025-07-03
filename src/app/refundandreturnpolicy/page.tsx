import React from 'react';

const RefundReturnPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
          Refund and Return Policy
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Effective Date: March 24, 2025
        </p>

        {/* Introduction */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            At AIC Amal, the official donation platform of Akode Islamic Centre, we are committed to transparency in all our processes. This Refund and Return Policy outlines the conditions under which refunds may be requested for donations made through our platform. Please review it carefully.
          </p>
        </section>

        {/* Policy Sections */}
        <section className="space-y-6">
          {/* Donation Nature */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Donation Nature</h2>
            <p className="text-gray-700 leading-relaxed">
              All donations made through AIC Amal are voluntary and non-refunded, except under specific circumstances outlined below. We appreciate your support for our mission and strive to ensure clarity in our donation process.
            </p>
          </div>

          {/* Refund Conditions */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Conditions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds may be considered only in the following cases:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
              <li>The donation was made in error (e.g., incorrect amount or unintended transaction).</li>
              <li>The donation amount was charged more than once due to a technical error.</li>
              <li>The donor provides proof of the transaction and a valid reason for the refund request within three (3) days of the donation.</li>
            </ul>
          </div>

          {/* Refund Request Process */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Request Process</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To request a refund, please contact us with the following details:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed mb-4">
              <li>Transaction details (e.g., date, amount, and transaction ID).</li>
              <li>Your phone number associated with the donation.</li>
              <li>A clear explanation of the reason for the refund request.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Reach us at:
            </p>
            <ul className="text-gray-700 leading-relaxed">
              <li><strong>Email:</strong> <a href="mailto:islamiccentre.akod@gmail.com" className="text-blue-600 hover:underline">islamiccentre.akod@gmail.com</a></li>
              <li><strong>Phone:</strong> +91 97458 33399</li>
            </ul>
          </div>

          {/* Refund Method */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Method</h2>
            <p className="text-gray-700 leading-relaxed">
              Approved refunds will be processed to the original payment method within 7 to 14 working days from the date of approval. You will be notified once the refund is completed.
            </p>
          </div>

          {/* No Returns */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. No Returns</h2>
            <p className="text-gray-700 leading-relaxed">
              As AIC Amal is a donation platform, we do not offer returns or exchanges for digital services or contributions made. All donations are final unless they meet the refund conditions outlined above.
            </p>
          </div>
        </section>

        {/* Closing Note */}
        <section className="mt-6 text-center">
          <p className="text-gray-600">
            Thank you for supporting Akode Islamic Centre’s mission through AIC Amal. If you have any questions about this Refund and Return Policy, please don’t hesitate to contact us.
          </p>
        </section>
      </div>
    </main>
  );
};

export default RefundReturnPolicy;