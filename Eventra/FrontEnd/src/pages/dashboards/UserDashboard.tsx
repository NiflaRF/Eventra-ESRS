
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Calendar, 
  User, 
  FileText, 
  Bell,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import '../../App.css'; // Ensure global styles are available

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Search Venues',
      description: 'Find the perfect venue for your event',
      icon: Search,
      link: '/venues',
      color: 'bg-blue-500'
    },
    {
      title: 'New Booking',
      description: 'Book a venue for your upcoming event',
      icon: Plus,
      link: '/booking',
      color: 'bg-green-500'
    },
    {
      title: 'Submit Event Plan',
      description: 'Submit your event planning proposal',
      icon: FileText,
      link: '/event-planning',
      color: 'bg-purple-500'
    },
    {
      title: 'View Calendar',
      description: 'Check your upcoming bookings and events',
      icon: Calendar,
      link: '/booking',
      color: 'bg-orange-500'
    }
  ];

  const recentBookings = [
    {
      id: '1',
      title: 'Research Conference 2025',
      venue: 'Main Lecture Theater-MLT',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'Approved',
      participants: 600
    },
    {
      id: '2',
      title: 'Max Hackathon',
      venue: 'Main Computer Lab',
      date: '2025-05-21',
      time: '2:00 PM',
      status: 'Pending',
      participants: 100
    },
    {
      id: '3',
      title: 'Wellassa Kona Mangalya',
      venue: 'Open Ground',
      date: '2025-04-17',
      time: '8:00 AM',
      status: 'Under Review',
      participants: 1000
    }
  ];

  const notifications = [
    {
      id: '1',
      title: 'Booking Approved',
      message: 'Your Research Conference 2025 booking has been approved',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: '2',
      title: 'Document Required',
      message: 'Please submit additional documents for Wellassa Kona Mangalya',
      time: '1 day ago',
      type: 'warning'
    },
    {
      id: '3',
      title: 'Venue Available',
      message: 'New venue "TLH-1" is now available for booking',
      time: '2 days ago',
      type: 'info'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Layout>
      {/* Dashboard Background - solid Rose color */}
      <div className="relative min-h-screen w-full flex flex-col justify-center items-stretch" style={{ backgroundColor: '#bd7880' }}>
        {/* Removed background image and overlay for solid color */}
        <div className="relative z-10 space-y-8 animate-fade-in px-2 md:px-0 pt-0 pb-8 w-full flex justify-center">
          <div className="bg-black bg-opacity-30 rounded-2xl p-8 w-full max-w-7xl mx-auto">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
              {/* Welcome Section */}
              <div className="bg-transparent text-white py-12 px-8 shadow-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold mb-2">
                      Welcome, {user?.name}!
                    </h1>
                    <p className="text-white text-lg font-semibold">
                      Ready to organize your next amazing event?
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-black bg-opacity-60 rounded-lg p-4 flex items-center justify-center">
                      <Calendar size={48} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Each stat card is now transparent, no white box */}
                <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Total Bookings</p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <div className="bg-blue-900 bg-opacity-60 p-3 rounded-full">
                      <Calendar size={20} className="text-blue-200" />
                    </div>
                  </div>
                </div>
                <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Pending Approvals</p>
                      <p className="text-2xl font-bold text-white">3</p>
                    </div>
                    <div className="bg-yellow-900 bg-opacity-60 p-3 rounded-full">
                      <Clock size={20} className="text-yellow-200" />
                    </div>
                  </div>
                </div>
                <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Upcoming Events</p>
                      <p className="text-2xl font-bold text-white">5</p>
                    </div>
                    <div className="bg-green-900 bg-opacity-60 p-3 rounded-full">
                      <Users size={20} className="text-green-200" />
                    </div>
                  </div>
                </div>
                <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Available Venues</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="bg-purple-900 bg-opacity-60 p-3 rounded-full">
                      <MapPin size={20} className="text-purple-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="group bg-black bg-opacity-40 rounded-xl shadow-none p-6 hover:scale-105 transition-transform duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200 shadow-md bg-opacity-80`}> {/* keep color for icon */}
                          <action.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-white mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
                    <Link
                      to="/booking"
                      className="text-white hover:text-gray-200 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-black hover:bg-opacity-60 transition-colors bg-transparent">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{booking.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-white">
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {booking.venue}
                            </div>
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {booking.date}
                            </div>
                            <div className="flex items-center">
                              <Users size={14} className="mr-1" />
                              {booking.participants}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div id="notifications" className="bg-black bg-opacity-40 rounded-xl shadow-none p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <Bell size={20} className="text-gray-200" />
                  </div>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border rounded-lg bg-transparent`}>
                        <h3 className="font-semibold text-white mb-1">{notification.title}</h3>
                        <p className="text-sm text-white mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-200">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
