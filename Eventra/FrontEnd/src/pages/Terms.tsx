import React from "react";

const Terms = () => (
  <div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
    <div className="relative z-10 w-full flex flex-col items-center">
      <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg">Terms & Conditions</h1>
        <div className="w-full bg-gray-800 bg-opacity-70 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Welcome to Eventra</h2>
          <p className="mb-4 text-white">By accessing or using Eventra, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">1. Use of Service</h3>
          <p className="mb-4 text-gray-100">Eventra is provided for the purpose of booking university venues and managing campus events. You agree to use the platform responsibly and in accordance with university policies.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">2. User Accounts</h3>
          <p className="mb-4 text-gray-100">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">3. Booking and Approvals</h3>
          <p className="mb-4 text-gray-100">All bookings and event approvals are subject to university rules and availability. Misuse of the system may result in suspension of access.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">4. Data Privacy</h3>
          <p className="mb-4 text-gray-100">Your data is handled in accordance with our privacy policy. We do not share your personal information with third parties except as required by law or university policy.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">5. Changes to Terms</h3>
          <p className="mb-4 text-gray-100">Eventra reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of the revised terms.</p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-white">6. Contact</h3>
          <p className="mb-4 text-gray-100">If you have any questions about these Terms & Conditions, please contact the university administration or the Eventra support team.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms; 