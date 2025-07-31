import React, { useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

interface DashboardNavbarProps {
  roleLabel?: string;
  notificationCount?: number;
}

const roleDisplay: Record<string, string> = {
  "vice-chancellor": "Vice Chancellor",
  administration: "Administration UWU",
  "student-union": "Student Union",
  warden: "Warden",
  student: "Student",
  faculty: "Faculty",
  admin: "Admin",
  "service-provider": "Service Provider",
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  roleLabel,
  notificationCount = 3,
}) => {
  const { user, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";
  const role =
    roleLabel || (user?.role ? roleDisplay[user.role] || user.role : "User");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 px-8 py-4 flex items-center justify-between w-full" style={{ backgroundColor: '#4d0011' }}>
      <div className="flex items-center">
        <img src="/Logo UWU.png" alt="Eventra Logo" className="h-8 w-auto mr-2" />
        <span className="text-2xl font-bold text-blue-600">Eventra</span>
      </div>
      <div className="flex items-center gap-8">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => {
              const el = document.getElementById('notifications');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="focus:outline-none"
          >
            <Bell className="text-gray-700" size={26} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          </button>
        </div>
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen((open) => !open)}
            className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <span className="bg-blue-500 text-white font-bold rounded-full w-9 h-9 flex items-center justify-center text-base">
              {initials}
            </span>
            <div className="hidden sm:block text-left">
              <span className="font-semibold text-gray-900 leading-tight">
                {user?.name || "User"}
              </span>
              <span className="block text-xs text-gray-500 leading-tight">{role}</span>
            </div>
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <User size={16} className="mr-3" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;







    