import React from "react";

const PrivacyPolicy = () => (
  <div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
    <div className="relative z-10 w-full flex flex-col items-center">
      <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg">Privacy & Policy</h1>
        <div className="w-full bg-gray-800 bg-opacity-70 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Privacy Matters</h2>
          <p className="mb-4 text-white">This Privacy Policy explains how Eventra collects, uses, and protects your personal information when you use our platform. By accessing or using Eventra, you agree to the terms of this Privacy Policy.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">1. Information We Collect</h3>
          <p className="mb-4 text-gray-100">We may collect personal information such as your name, email address, university affiliation, and usage data when you register, book venues, or interact with our services.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">2. How We Use Your Information</h3>
          <p className="mb-4 text-gray-100">Your information is used to provide and improve our services, process bookings, communicate with you, and ensure the security of our platform.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">3. Data Sharing and Disclosure</h3>
          <p className="mb-4 text-gray-100">We do not share your personal information with third parties except as required by law, university policy, or with your explicit consent.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">4. Data Security</h3>
          <p className="mb-4 text-gray-100">We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">5. Your Rights</h3>
          <p className="mb-4 text-gray-100">You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">6. Changes to This Policy</h3>
          <p className="mb-4 text-gray-100">We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">7. Contact</h3>
          <p className="mb-4 text-gray-100">If you have any questions about this Privacy Policy, please contact the Eventra support team or university administration.</p>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy; 