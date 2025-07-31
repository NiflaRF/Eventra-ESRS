
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  CheckCircle, 
  FileText, 
  BarChart3, 
  Shield,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const overviewCards = [
    {
      title: 'Pending Bookings',
      value: '8',
      change: '+2 from yesterday',
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/tools?tab=approvals'
    },
    {
      title: 'Event Requests',
      value: '12',
      change: '+5 from last week',
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/tools?tab=approvals'
    },
    {
      title: 'Active Venues',
      value: '24',
      change: '2 new this month',
      icon: MapPin,
      color: 'bg-green-500',
      link: '/venues'
    },
    {
      title: 'Total Users',
      value: '800',
      change: '+23 this week',
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/tools'
    }
  ];

  const adminActions = [
    {
      title: 'Manage Users',
      icon: Users,
      link: '/admin/tools',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Venues',
      icon: MapPin,
      link: '/venues',
      color: 'bg-green-500'
    },
    {
      title: 'Booking Approvals',
      icon: CheckCircle,
      link: '/admin/tools?tab=approvals',
      color: 'bg-yellow-500'
    },
    {
      title: 'Event Planning Approvals',
      icon: FileText,
      link: '/admin/tools?tab=approvals',
      color: 'bg-purple-500'
    },
    {
      title: 'Reports & Analytics',
      icon: BarChart3,
      link: '/admin/reports',
      color: 'bg-indigo-500'
    },
    {
      title: 'System Logs',
      icon: Shield,
      link: '/admin/tools?tab=logs',
      color: 'bg-red-500'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      action: 'Booking Approved',
      user: 'Kasun Aberathna',
      details: 'Tech Conference 2025 - E Block Main Auditorium',
      time: '10 minutes ago',
      type: 'approval'
    },
    {
      id: '2',
      action: 'New User Registration',
      user: 'Amali Gunarathna',
      details: 'Student role - Computer Science and Informatics Department',
      time: '1 hour ago',
      type: 'registration'
    },
    {
      id: '3',
      action: 'Venue Updated',
      user: 'Admin',
      details: 'Technology Auditorium - Capacity increased to 150',
      time: '2 hours ago',
      type: 'update'
    },
    {
      id: '4',
      action: 'Event Plan Submitted',
      user: 'Chanaka Jayaweera',
      details: 'Annual Food and Agricultural Expo - Multiple venues required',
      time: '3 hours ago',
      type: 'submission'
    }
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'Booking Request',
      title: 'Social Night 2025',
      requester: 'Student Union',
      venue: 'Open Ground',
      date: '2025-04-15',
      urgency: 'high'
    },
    {
      id: '2',
      type: 'Event Plan',
      title: 'InnovateX',
      requester: 'Diluksha Perera',
      venue: 'Tecnology Lecture Hall 1',
      date: '2025-06-26',
      urgency: 'medium'
    },
    {
      id: '3',
      type: 'Venue Access',
      title: 'Equipment Setup',
      requester: 'Technical Team of CSI Department',
      venue: 'Main Computer Lab',
      date: '2025-03-20',
      urgency: 'low'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return CheckCircle;
      case 'registration':
        return Users;
      case 'update':
        return MapPin;
      case 'submission':
        return FileText;
      default:
        return Clock;
    }
  };

  return (
    <Layout showSidebar={true}>
      <div 
        className="min-h-full"
        style={{ backgroundColor: '#bd7880' }}
      >
        {/* Removed background image and overlay for solid color */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="bg-black/30 backdrop-blur-sm text-white rounded-2xl py-12 px-8 shadow-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold mb-2">
                      Welcome, {user?.name}!
                    </h1>
                    <p className="text-white/90 text-lg font-semibold">
                      Manage the entire event management system from here
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center border border-white/10">
                      <Shield size={48} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${card.color} bg-opacity-80 p-3 rounded-xl text-white transition-transform duration-200 shadow-lg`}>
                        <card.icon size={24} />
                      </div>
                      <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">{card.title}</p>
                      <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                      <p className="text-xs text-white/70">{card.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Actions */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6 hover:scale-105 transition-all duration-200 group hover:bg-black/40"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`${action.color} bg-opacity-80 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                          <action.icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {action.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Pending Approvals</h2>
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                    <ul className="divide-y divide-white/10">
                      {pendingApprovals.map(item => (
                        <li key={item.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-sm text-white/80">{item.type} &ndash; {item.requester} &ndash; {item.venue}</div>
                            <div className="text-xs text-white/60">{item.date}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ml-2
                            ${item.urgency === 'high' ? 'bg-red-900/60 text-red-200 border border-red-500/30' :
                              item.urgency === 'medium' ? 'bg-yellow-900/60 text-yellow-200 border border-yellow-500/30' :
                              'bg-green-900/60 text-green-200 border border-green-500/30'}`}>{item.urgency.toUpperCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Recent Activities</h2>
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                    <ul className="divide-y divide-white/10">
                      {recentActivities.map(activity => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <li key={activity.id} className="py-4 flex items-center gap-4">
                            <div className="bg-blue-900/60 backdrop-blur-sm p-3 rounded-full text-white flex items-center justify-center border border-blue-500/30 shadow-lg">
                              <Icon size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-white">{activity.action}</div>
                              <div className="text-sm text-white/80">{activity.user} &ndash; {activity.details}</div>
                            </div>
                            <div className="text-xs text-white/60">{activity.time}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    
    </Layout>
  );
};

export default AdminDashboard;