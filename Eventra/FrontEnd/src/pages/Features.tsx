import React from "react";
import { Card } from "../components/ui/card";

const features = [
  {
    title: "Venue Booking",
    description: "Easily reserve university venues for seminars, cultural, and academic events.",
    icon: "🏛️",
  },
  {
    title: "Event Planning Workflow",
    description: "Streamline event planning with our step-by-step workflow tools.",
    icon: "🗂️",
  },
  {
    title: "Admin & Service Provider Support",
    description: "Admins and service providers can manage requests and resources efficiently.",
    icon: "🛠️",
  },
  {
    title: "Role-based Dashboards",
    description: "Personalized dashboards for students, admins, and service providers.",
    icon: "📊",
  },
];

const Features = () => (
  <div className="min-h-screen bg-gray-50 py-16 px-4">
    <h1 className="text-4xl font-bold text-center mb-10 text-blue-700">Key Features</h1>
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, idx) => (
        <Card key={idx} className="flex flex-col items-center p-6 bg-white shadow hover:shadow-lg transition rounded-xl">
          <div className="text-5xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-blue-800">{feature.title}</h3>
          <p className="text-gray-600 text-center">{feature.description}</p>
        </Card>
      ))}
    </div>
  </div>
);

export default Features;
