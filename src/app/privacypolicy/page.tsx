import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Effective Date: March 24, 2025
        </p>

        {/* Introduction */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            At Akode Islamic Centre (legally registered as Islamic Centre Virippadam), referred to as “we,” “us,” or “our,” we are committed to protecting your privacy. Through our AIC Amal app and official website (www.aicedu.in), we facilitate charitable donations with transparency and care. This Privacy Policy explains how we collect, use, and safeguard your personal information to ensure your trust and confidence.
          </p>
        </section>

        {/* Policy Sections */}
        <section className="space-y-6">
          {/* Data We Collect */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not track user activity or behavior on our platform. We collect only the following personal information when you make a donation, solely for donation processing and internal purposes:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
              <li>Name</li>
              <li>Place</li>
              <li>District</li>
              <li>Panchayath, Municipality, or Corporation</li>
              <li>State</li>
              <li>Phone number</li>
              <li>Email address (optional)</li>
            </ul>
          </div>

          {/* Purpose of Data Collection */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Purpose of Data Collection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information only when you choose to donate. This data is used exclusively to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
              <li>Process your donations and issue legal receipts.</li>
              <li>Streamline donation management for efficiency.</li>
              <li>Maintain internal records for transparency and accountability.</li>
              <li>Comply with legal and audit requirements.</li>
              <li>Communicate with you via SMS, WhatsApp, or email (if provided) regarding your donations.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Your data is not used for tracking, behavioral analytics, or any unrelated purposes.
            </p>
          </div>

          {/* Data Sharing */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or share your personal information with third parties, except in the following cases:
            </p>
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
              <li>To comply with applicable laws or legal obligations.</li>
              <li>With trusted payment processors, solely to facilitate secure donation transactions.</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We employ robust technical and organizational measures to protect your personal information, ensuring its confidentiality, integrity, and security against unauthorized access or misuse.
            </p>
          </div>

          {/* User Rights */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to access, correct, or request deletion of your personal information held by us. To exercise these rights or for any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="text-gray-700 leading-relaxed">
              <li><strong>Phone:</strong> +91 97458 33399</li>
              <li><strong>Email:</strong> <a href="mailto:islamiccentre.akod@gmail.com" className="text-blue-600 hover:underline">islamiccentre.akod@gmail.com</a></li>
            </ul>
          </div>
        </section>

        {/* Closing Note */}
        <section className="mt-6 text-center">
          <p className="text-gray-600">
            Thank you for choosing AIC Amal to support Akode Islamic Centre’s mission. We value your trust and are dedicated to protecting your privacy.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;