
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Filter,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-01-07'
  });
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [venueFilter, setVenueFilter] = useState('all');

  // Mock report data
  const reportData = [
    {
      id: '1',
      eventName: 'Tech Conference 2024',
      date: '2024-01-15',
      type: 'Conference',
      venue: 'Main Auditorium',
      participants: 200,
      status: 'Completed',
      rating: 4.8,
      feedback: 'Excellent organization and content'
    },
    {
      id: '2',
      eventName: 'Cultural Night',
      date: '2024-01-20',
      type: 'Cultural',
      venue: 'Open Ground',
      participants: 500,
      status: 'Completed',
      rating: 4.5,
      feedback: 'Great performances, needs better sound system'
    },
    {
      id: '3',
      eventName: 'Academic Symposium',
      date: '2024-01-25',
      type: 'Academic',
      venue: 'Conference Hall',
      participants: 100,
      status: 'Completed',
      rating: 4.2,
      feedback: 'Informative sessions, venue was perfect'
    }
  ];

  const feedbackData = [
    {
      id: '1',
      eventName: 'Tech Conference 2024',
      rating: 5,
      comment: 'Outstanding event! Great speakers and well organized.',
      attendee: 'John Doe',
      date: '2024-01-16'
    },
    {
      id: '2',
      eventName: 'Tech Conference 2024',
      rating: 4,
      comment: 'Good content but the venue was a bit crowded.',
      attendee: 'Jane Smith',
      date: '2024-01-16'
    },
    {
      id: '3',
      eventName: 'Cultural Night',
      rating: 5,
      comment: 'Amazing performances! Loved the cultural diversity.',
      attendee: 'Alex Johnson',
      date: '2024-01-21'
    }
  ];

  const eventTypes = ['Conference', 'Cultural Events', 'Sports Events', 'Social Events','Club Events'];
  const venues = ['Auditorium', 'Lecture Theater', 'Outdoor', 'Laboratories'];

  const filteredReports = reportData.filter(report => {
    const matchesType = eventTypeFilter === 'all' || report.type === eventTypeFilter;
    const matchesVenue = venueFilter === 'all' || report.venue === venueFilter;
    const reportDate = new Date(report.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = reportDate >= startDate && reportDate <= endDate;
    
    return matchesType && matchesVenue && matchesDate;
  });

  const handleExportPDF = () => {
    console.log('Exporting PDF report...');
    // In a real app, this would generate and download a PDF
    alert('PDF report would be generated and downloaded');
  };

  const handleExportExcel = () => {
    console.log('Exporting Excel report...');
    // In a real app, this would generate and download an Excel file
    alert('Excel report would be generated and downloaded');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalEvents = 45;
  const totalParticipants = 760;
  const averageParticipants = 278;

  return (
    <Layout showSidebar={true} backgroundImage="/Wrd.jpg">
      <div className="min-h-screen w-full flex flex-col items-stretch" style={{ backgroundColor: '#bd7880' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8 animate-fade-in text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                <p className="text-white/90 mt-2">Generate and analyze event reports</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button
                  onClick={handleExportPDF}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center hover:bg-white/20 transition-colors border border-white/20"
                >
                  <FileText size={20} className="mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Download size={20} className="mr-2" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Report Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Event Type</label>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Types</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Venue</label>
                  <select
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                    className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Venues</option>
                    {venues.map(venue => (
                      <option key={venue} value={venue}>{venue}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Total Events</p>
                    <p className="text-2xl font-bold text-white">{totalEvents}</p>
                  </div>
                  <div className="bg-blue-900/60 backdrop-blur-sm p-3 rounded-full border border-blue-500/30">
                    <Calendar size={24} className="text-blue-200" />
                  </div>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Total Participants</p>
                    <p className="text-2xl font-bold text-white">{totalParticipants}</p>
                  </div>
                  <div className="bg-green-900/60 backdrop-blur-sm p-3 rounded-full border border-green-500/30">
                    <Users size={24} className="text-green-200" />
                  </div>
                </div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">Avg Participants</p>
                    <p className="text-2xl font-bold text-white">{averageParticipants}</p>
                  </div>
                  <div className="bg-purple-900/60 backdrop-blur-sm p-3 rounded-full border border-purple-500/30">
                    <TrendingUp size={24} className="text-purple-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Report Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  console.log('Generating comprehensive report...');
                  alert('Comprehensive report would be generated with all filtered data');
                }}
                className="bg-white/10 backdrop-blur-sm text-white text-lg px-8 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center mx-auto"
              >
                <BarChart3 size={24} className="mr-3" />
                Generate Comprehensive Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
