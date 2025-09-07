import React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 p-8 flex items-center justify-between mb-8 mt-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Welcome, {user?.name || "User"}!
        </h2>
        {user?.role !== 'student-union' && user?.role !== 'vice-chancellor' && user?.role !== 'administration' && user?.role !== 'warden' && (
          <p className="text-white text-base opacity-90">
            Ready to organize your next amazing event?
          </p>
        )}
      </div>
      <div className="bg-white bg-opacity-10 rounded-lg p-4 flex items-center justify-center">
        <Calendar className="text-white" size={40} />
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
