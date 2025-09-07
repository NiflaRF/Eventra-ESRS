import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2 } from "lucide-react";

const sidebarItems = [
  // Removed Dashboard card for Vice Chancellor dashboard
];

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="w-56 bg-white shadow-lg rounded-xl p-4 mt-8 mb-8 ml-2">
      <nav className="flex flex-col gap-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-5 py-3 rounded-lg font-medium text-base transition
              ${location.pathname === item.path
                ? "bg-blue-50 text-blue-700 shadow"
                : "hover:bg-blue-50/70 text-gray-700"}
            `}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
