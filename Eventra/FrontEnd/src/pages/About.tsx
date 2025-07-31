import React from "react";

const aboutText = `Eventra is a smart, purpose-driven event space reservation system developed to transform how events are organized at Uva Wellassa University. Designed with precision and a deep understanding of campus needs, Eventra simplifies the entire event planning journey from venue discovery and booking to approvals and seamless coordination.\n\nIn an academic environment where innovation meets tradition, Eventra empowers students, faculty, service providers, and administrators with a streamlined platform to manage cultural, academic, and sports events effortlessly. Our system supports role-based dashboards, real-time notifications, digital document submission, and transparent approval workflows ensuring every event is managed with clarity and control.\n\nCrafted by a dynamic team of Computer Science undergraduates, Eventra reflects the spirit of collaboration, problem-solving, and digital excellence. It's more than just a reservation tool it's a step forward in enhancing campus experiences through smart technology.\n\nAt Uva Wellassa University, where every event tells a story, Eventra is here to ensure it begins with the perfect space.`;

const stats = [
  {
    value: "20+",
    label: "University Venues Integrated"
  },
  {
    value: "60+",
    label: "Successful Events Hosted"
  },
  {
    value: "700+",
    label: "Active Registered Users"
  }
];

const About = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-stretch relative" style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: '#bd7880' }}>
      {/* Removed background image and overlay for solid color */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="about-container w-full max-w-3xl mx-auto mt-12 mb-12 px-8 py-10 bg-black bg-opacity-70 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg">About Us</h1>
          <div className="w-full flex flex-col gap-6 mb-10">
            {aboutText.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="text-xl text-gray-100 text-justify leading-relaxed mb-2 font-medium drop-shadow">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-8 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <span className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow">{stat.value}</span>
                <span className="text-md sm:text-lg text-gray-200 text-center font-medium drop-shadow">{stat.label}</span>
              </div>
            ))}
          </div>
          {/* Vision and Mission Section */}
          <div className="w-full bg-gray-800 bg-opacity-70 rounded-xl shadow-lg p-8 mt-4">
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-lg text-gray-100 mb-6 font-medium">Empowering our university with smart, scalable event solutions for a seamless campus experience.<br />We're shaping the future of event planning fast, flexible, and fully digital.</p>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-lg text-gray-100 font-medium">To simplify space booking and event approvals with a modern, all-in-one platform.<br />We connect students, staff, and services making campus events effortless.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 