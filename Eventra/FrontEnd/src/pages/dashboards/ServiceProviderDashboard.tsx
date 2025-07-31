import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, XCircle, MessageSquare, MapPin, Calendar, Bell, LogOut, Home, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import Layout from '../../components/Layout';

// Dummy data for requests and notifications
const DUMMY_REQUESTS = [
  {
    id: 1,
    eventName: 'Annual Cultural Festival',
    requestedBy: { name: 'Ravindu Lakmal', email: 'ravindu@university.edu' },
    venue: 'Main Lecture Theater',
    dateTime: '2025-07-10  18:00',
    serviceType: 'Sound System',
    status: 'Pending',
    priority: 'High',
    description: 'Need full sound setup for 500+ audience.',
    requestType: 'venue_booking'
  },
  {
    id: 2,
    eventName: 'Tech Talk 2025',
    requestedBy: { name: 'Diluksha Perera', email: 'dilukshp@university.edu' },
    venue: 'TLH-1',
    dateTime: '2025-07-12  14:00',
    serviceType: 'Media Support',
    status: 'Pending',
    priority: 'Medium',
    description: 'Projector and live streaming required.',
    requestType: 'venue_booking'
  },
  {
    id: 3,
    eventName: 'Sports Fiesta',
    requestedBy: { name: 'Nilmini Ranathunga', email: 'Nilmini@university.edu' },
    venue: 'Open Ground',
    dateTime: '2025-07-15  09:00',
    serviceType: 'Sound System',
    status: 'Approved',
    priority: 'Low',
    description: 'Basic sound system for announcements.',
    requestType: 'venue_booking'
  },
  {
    id: 4,
    eventName: 'Music Night-Handhaewa',
    requestedBy: { name: 'Pasindhu Gunawardana', email: 'pasindu@university.edu' },
    venue: 'Open Air Theater',
    dateTime: '2025-08-05T19:00',
    serviceType: 'Sound System',
    status: 'Pending',
    priority: 'Medium',
    description: 'High-quality sound setup needed for live band performance.',
    requestType: 'venue_booking'
  },
  {
    id: 5,
    eventName: 'Research Conference',
    requestedBy: { name: 'Kavindya Nethmi', email: 'kavindya@university.edu' },
    venue: 'Main Lecture Theater',
    dateTime: '2025-08-20  10:00',
    serviceType: 'Media Support',
    status: 'Approved',
    priority: 'High',
    description: 'Full media coverage and recording for the event.',
    requestType: 'venue_booking'
  },
  {
    id: 6,
    eventName: 'CST Alumni Meetup',
    requestedBy: { name: 'Suresh Kumar', email: 'suresh@university.edu' },
    venue: 'E1- Main Auditorium',
    dateTime: '2025-09-10  16:00',
    serviceType: 'Media Support',
    status: 'Pending',
    priority: 'Low',
    description: 'Photography and video recording required for alumni gathering.',
    requestType: 'venue_booking'
  },
  // Event Planning Requests with Multiple Services
  {
    id: 7,
    eventName: 'Research Conference 2025',
    requestedBy: { name: 'Chamali Kumari', email: 'chamali@university.edu' },
    venue: 'Main Lecture Theater-MLT',
    dateTime: '2025-05-20',
    serviceType: 'Event Planning',
    status: 'Pending',
    priority: 'High',
    description: 'Annual research conference with 200 participants',
    requestType: 'event_planning',
    services: [
      'Projector & Audio System',
      'Stage Setup',
      'Lighting System',
      'Security Services',
      'Catering Services'
    ],
    participants: 200
  },
  {
    id: 8,
    eventName: 'University Cultural Festival',
    requestedBy: { name: 'Dilshan Perera', email: 'dilshan@university.edu' },
    venue: 'Open Air Theater',
    dateTime: '2025-06-15',
    serviceType: 'Event Planning',
    status: 'Pending',
    priority: 'High',
    description: 'Annual cultural festival with performances and exhibitions',
    requestType: 'event_planning',
    services: [
      'Sound System',
      'Stage Setup',
      'Lighting System',
      'Security Services',
      'Catering Services',
      'Media Support'
    ],
    participants: 500
  },
  {
    id: 9,
    eventName: 'Tech Innovation Summit',
    requestedBy: { name: 'Nimal Silva', email: 'nimal@university.edu' },
    venue: 'E1- Main Auditorium',
    dateTime: '2025-07-10',
    serviceType: 'Event Planning',
    status: 'Approved',
    priority: 'Medium',
    description: 'Technology innovation summit with workshops and presentations',
    requestType: 'event_planning',
    services: [
      'Projector & Audio System',
      'Stage Setup',
      'Lighting System',
      'Security Services'
    ],
    participants: 150
  }
];

const DUMMY_NOTIFICATIONS = [
  { id: 1, message: '🔔 New request: "Tech Talk 2025" requires Sound System.', time: 'Just now' },
  { id: 2, message: '🔔 New request: "Annual Cultural Fest" requires Media.', time: '2 min ago' },
  { id: 3, message: '🔔 Request "Sports Fiesta" approved.', time: '10 min ago' },
];

// Reusable card for service types
const ServiceTypeCard: React.FC<{ type: string }> = ({ type }) => (
  <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center">
    <span className="text-lg font-bold text-indigo-700">{type}</span>
    <span className="text-xs text-gray-500">Service Type</span>
  </div>
);

const ServiceProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(DUMMY_REQUESTS);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const [showNotif, setShowNotif] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; requestId: number | null; action: 'approve' | 'reject' | null }>({ open: false, requestId: null, action: null });
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Show all requests regardless of user serviceType
  const filteredRequests = requests;

  // Stats
  const pendingCount = filteredRequests.filter(r => r.status === 'Pending').length;
  const approvedToday = filteredRequests.filter(r => r.status === 'Approved').length;
  const eventPlanningCount = filteredRequests.filter(r => r.requestType === 'event_planning').length;

  // Simulate auto-notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotif = { id: Date.now(), message: `🔔 Auto-notification: New service request submitted for ${user?.serviceType}.`, time: 'Now' };
      setNotifications(prev => [newNotif, ...prev.slice(0, 2)]);
      console.log(newNotif.message);
    }, 8000);
    return () => clearTimeout(timer);
  }, [user?.serviceType]);

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setModal({ open: true, requestId: id, action });
      setComment('');
      setCommentError('');
    }
  };

  const handleModalSubmit = () => {
    if (!comment.trim()) {
      setCommentError('Comment is required.');
      return;
    }
    
    const request = requests.find(r => r.id === modal.requestId);
    if (request) {
      setRequests(prev => prev.map(r => r.id === modal.requestId ? { ...r, status: modal.action === 'approve' ? 'Approved' : 'Rejected' } : r));
      
      // Simulate sending notification to admin dashboard
      console.log(`${modal.action === 'approve' ? 'Approval' : 'Rejection'} notification sent to admin dashboard`);
      console.log(`Service Provider Comment: ${comment}`);
      console.log(`Request: ${request.eventName}`);
      console.log(`Services: ${request.services ? request.services.join(', ') : request.serviceType}`);
      
      // Show success message
      const message = modal.action === 'approve' 
        ? `Service approval notification sent to admin dashboard for ${request.eventName}`
        : `Service rejection notification sent to admin dashboard for ${request.eventName}`;
      toast({ title: `Request ${modal.action === 'approve' ? 'approved' : 'rejected'}!`, description: message });
      
      setModal({ open: false, requestId: null, action: null });
      setComment('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Notification bell and dropdown for Layout
  const notificationBell = (
    <div className="relative">
      <button className="p-2 hover:bg-gray-800 rounded-lg relative" onClick={() => setShowNotif(prev => !prev)}>
        <Bell className="w-6 h-6 text-gray-300" />
        {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">{notifications.length}</span>}
      </button>
      {showNotif && (
        <div id="notifications" className="absolute right-0 top-10 w-80 bg-black bg-opacity-90 shadow-lg rounded-lg p-4 z-20 animate-fade-in">
          <h4 className="font-semibold mb-2 text-white">Recent Notifications</h4>
          <ul className="space-y-2">
            {notifications.slice(0, 3).map(n => (
              <li key={n.id} className="text-sm text-white">{n.message} <span className="text-xs text-gray-400">({n.time})</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Layout notificationBell={notificationBell}>
      <div className="relative min-h-screen w-full flex flex-col justify-center items-stretch" style={{ backgroundColor: '#bd7880' }}>
        <div className="relative z-10 space-y-8 animate-fade-in px-2 md:px-0 pt-0 pb-8">
          {/* Welcome Section at the very top */}
          <div className="w-full flex justify-center">
            <div className="bg-transparent text-white rounded-xl py-12 px-8 shadow-none w-full max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">
                    Welcome, {user?.name || 'Service Provider'}!
                  </h1>
                  <p className="text-white text-lg font-semibold">
                    Ready to manage event planning service requests and support events?
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-black bg-opacity-60 rounded-lg p-4 flex items-center justify-center">
                    <Calendar size={48} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content Container for stats and requests */}
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 space-y-8 bg-black bg-opacity-30 rounded-2xl shadow-lg">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
              <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Pending Requests</p>
                    <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  </div>
                  <div className="bg-yellow-900 bg-opacity-60 p-3 rounded-full">
                    <ClipboardList size={20} className="text-yellow-200" />
                  </div>
                </div>
              </div>
              <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Approved Today</p>
                    <p className="text-2xl font-bold text-white">{approvedToday}</p>
                  </div>
                  <div className="bg-green-900 bg-opacity-60 p-3 rounded-full">
                    <BadgeCheck size={20} className="text-green-200" />
                  </div>
                </div>
              </div>
              <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Total Requests</p>
                    <p className="text-2xl font-bold text-white">{filteredRequests.length}</p>
                  </div>
                  <div className="bg-blue-900 bg-opacity-60 p-3 rounded-full">
                    <ClipboardList size={20} className="text-blue-200" />
                  </div>
                </div>
              </div>
              <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Event Planning</p>
                    <p className="text-2xl font-bold text-white">{eventPlanningCount}</p>
                  </div>
                  <div className="bg-indigo-900 bg-opacity-60 p-3 rounded-full">
                    <Calendar size={20} className="text-indigo-200" />
                  </div>
                </div>
              </div>
            </div>
            {/* Request List */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">Event Planning Requests</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.filter(r => r.requestType === 'event_planning').map(req => (
                  <div key={req.id} className="bg-black bg-opacity-40 rounded-xl shadow-none p-6 hover:scale-105 transition-all flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg text-white">{req.eventName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${req.status === 'Pending' ? 'bg-yellow-900 bg-opacity-60 text-yellow-200' : req.status === 'Approved' ? 'bg-green-900 bg-opacity-60 text-green-200' : 'bg-red-900 bg-opacity-60 text-red-200'}`}>{req.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-200">
                      <div><span className="font-medium">Requested by:</span> {req.requestedBy.name}</div>
                      <div><span className="font-medium">Email:</span> {req.requestedBy.email}</div>
                      <div><span className="font-medium">Venue:</span> {req.venue}</div>
                      <div><span className="font-medium">Date:</span> {new Date(req.dateTime).toLocaleDateString()}</div>
                      <div><span className="font-medium">Participants:</span> {req.participants}</div>
                      <div><span className="font-medium">Priority:</span> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${req.priority === 'High' ? 'bg-red-900 bg-opacity-60 text-red-200' : req.priority === 'Medium' ? 'bg-yellow-900 bg-opacity-60 text-yellow-200' : 'bg-green-900 bg-opacity-60 text-green-200'}`}>{req.priority}</span></div>
                    </div>
                    
                    <div className="text-sm text-white">{req.description}</div>
                    
                    {/* Services Requested */}
                    <div>
                      <h4 className="font-medium text-white mb-2">Services Requested:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {req.services?.map((service, index) => (
                          <div key={index} className="flex items-center text-sm text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {req.status === 'Pending' && <>
                        <Button variant="ghost" className="bg-green-900 bg-opacity-60 text-white hover:bg-green-800" onClick={() => handleAction(req.id, 'approve')}><BadgeCheck className="w-4 h-4 mr-1" /> Approve</Button>
                        <Button variant="ghost" className="bg-red-900 bg-opacity-60 text-white hover:bg-red-800" onClick={() => handleAction(req.id, 'reject')}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                      </>}
                      {req.status !== 'Pending' && <span className="text-xs text-gray-400">No actions available</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Approval Modal */}
        <Dialog open={modal.open} onOpenChange={open => setModal(m => ({ ...m, open }))}>
          <DialogContent className="bg-black bg-opacity-90 border border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">
                {modal.action === 'approve' ? 'Approve' : 'Reject'} Service Request
              </DialogTitle>
            </DialogHeader>
            
            {/* Request Details */}
            {modal.requestId && (() => {
              const request = requests.find(r => r.id === modal.requestId);
              return request ? (
                <div className="mb-4">
                  <span className="font-semibold text-white">Request Details:</span>
                  <div className="border border-gray-600 rounded-md mt-2 p-3 bg-gray-800/60 text-white">
                    <div className="mb-2">
                      <span className="font-medium">Event:</span> {request.eventName}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Requested by:</span> {request.requestedBy.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Venue:</span> {request.venue}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Date:</span> {new Date(request.dateTime).toLocaleDateString()}
                    </div>
                    {request.services && (
                      <div>
                        <span className="font-medium">Services:</span>
                        <div className="mt-1 space-y-1">
                          {request.services.map((service, index) => (
                            <div key={index} className="text-sm text-gray-300">
                              • {service}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            

            
            {/* Comment Field */}
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-white">
                {modal.action === 'approve' ? 'Approval' : 'Rejection'} Comment (Required):
              </label>
              <textarea
                className="w-full border border-gray-600 rounded-md p-3 bg-gray-800 bg-opacity-60 text-white placeholder-gray-300"
                rows={4}
                placeholder={modal.action === 'approve' 
                  ? "Add comments about service availability, quality, or any special requirements..." 
                  : "Add comments about why services cannot be provided or any alternatives..."}
                value={comment}
                onChange={e => { setComment(e.target.value); setCommentError(''); }}
              />
              <p className="text-xs text-gray-400 mt-1">
                This comment will be sent as a notification to the admin dashboard
              </p>
            </div>
            
            {commentError && <div className="text-red-400 text-xs mb-2">{commentError}</div>}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="bg-gray-700 bg-opacity-60 text-white border-gray-600 hover:bg-gray-600"
                onClick={() => {
                  setModal({ open: false, requestId: null, action: null });
                  setComment('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant={modal.action === 'approve' ? 'default' : 'destructive'} 
                className={modal.action === 'approve' 
                  ? 'bg-green-700 bg-opacity-60 text-white hover:bg-green-600' 
                  : 'bg-red-700 bg-opacity-60 text-white hover:bg-red-600'
                }
                onClick={handleModalSubmit}
              >
                {modal.action === 'approve' ? 'Send Approval' : 'Send Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </Layout>
  );
};

export default ServiceProviderDashboard;
