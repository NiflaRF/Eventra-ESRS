import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, XCircle, MessageSquare, MapPin, Calendar, Bell, LogOut, Home, ClipboardList, User, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import Layout from '../../components/Layout';
import apiService from '../../services/api';

interface EventPlanRequest {
  id: number;
  title: string;
  type: string;
  organizer: string;
  date: string;
  time?: string;
  participants: number;
  facilities?: string[];
  documents?: string[];
  approval_documents?: {
    vc_approval?: string;
    administration_approval?: string;
    warden_approval?: string;
    student_union_approval?: string;
  };
  remarks?: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  status: 'unread' | 'read';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

const ServiceProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<EventPlanRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; requestId: number | null; action: 'approve' | 'reject' | null }>({ open: false, requestId: null, action: null });
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, forwarded: 0, approved: 0, rejected: 0 });

  // Fetch event planning requests
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch both submitted and forwarded event plans (pending requests)
      const [submittedResponse, forwardedResponse] = await Promise.all([
        apiService.getEventPlans({ status: 'submitted' }),
        apiService.getEventPlans({ status: 'forwarded_to_service_provider' })
      ]);
      
      let pendingRequests = [];
      
      if (submittedResponse.success) {
        pendingRequests = [...(submittedResponse.data || [])];
      }
      
      if (forwardedResponse.success) {
        pendingRequests = [...pendingRequests, ...(forwardedResponse.data || [])];
      }
      
      // Fetch signed letters by service provider to filter out already processed requests
      const signedLettersResponse = await apiService.getSignedLetters({
        from_role: 'service-provider'
      });
      
      let processedEventPlanIds: number[] = [];
      if (signedLettersResponse.success && signedLettersResponse.data) {
        processedEventPlanIds = signedLettersResponse.data
          .filter((letter: any) => letter.event_plan_id)
          .map((letter: any) => parseInt(letter.event_plan_id));
      }
      
      // Filter out event plans that service provider has already processed
      const unprocessedRequests = pendingRequests.filter((request: any) => 
        !processedEventPlanIds.includes(request.id)
      );
      
      // Also fetch approved and rejected requests for accurate counts
      const [approvedResponse, rejectedResponse] = await Promise.all([
        apiService.getEventPlans({ status: 'approved' }),
        apiService.getEventPlans({ status: 'rejected' })
      ]);
      
      let allRequests = [...unprocessedRequests];
      
      if (approvedResponse.success) {
        allRequests = [...allRequests, ...(approvedResponse.data || [])];
      }
      
      if (rejectedResponse.success) {
        allRequests = [...allRequests, ...(rejectedResponse.data || [])];
      }
      
      console.log('Service Provider: Unprocessed requests:', unprocessedRequests);
      console.log('Service Provider: All requests for counts:', allRequests);
      console.log('Service Provider: Processed event plan IDs:', processedEventPlanIds);
      console.log('Service Provider: Status breakdown:', {
        submitted: unprocessedRequests.filter(r => r.status === 'submitted').length,
        forwarded: unprocessedRequests.filter(r => r.status === 'forwarded_to_service_provider').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length,
        total: allRequests.length
      });
      
      // Set stats for counters
      setStats({
        pending: unprocessedRequests.length,
        forwarded: unprocessedRequests.filter(r => r.status === 'forwarded_to_service_provider').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length
      });
      
      // Set only unprocessed requests for display (already filtered)
      setRequests(unprocessedRequests);
    } catch (error) {
      console.error('Error fetching event planning requests:', error);
      toast.error('Error fetching event planning requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications({ limit: 10 });
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  // Simulate real-time notifications for new requests
  useEffect(() => {
    if (requests.length > 0) {
      const forwardedRequests = requests.filter(r => r.status === 'forwarded_to_service_provider');
      const submittedRequests = requests.filter(r => r.status === 'submitted');
      
      if (forwardedRequests.length > 0) {
        console.log(`🔔 Service Provider: You have ${forwardedRequests.length} forwarded event planning request(s) from Super-Admin awaiting service approval.`);
        console.log(`📧 Notification received from Super-Admin: ${forwardedRequests.length} event planning request(s) forwarded for service approval.`);
      }
      
      if (submittedRequests.length > 0) {
        console.log(`🔔 Service Provider: You have ${submittedRequests.length} submitted event planning request(s) awaiting service approval.`);
      }
      
      // Simulate real-time notification to super-admin
      console.log(`📧 Notification sent to Super-Admin: Service Provider has received ${requests.length} event planning request(s) for service approval.`);
    }
  }, [requests]);

  // Handle real-time notification updates
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (requests.length > 0) {
        // Simulate checking for new notifications
        console.log(`🔄 Service Provider Dashboard: Checking for new notifications...`);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(notificationInterval);
  }, [requests]);

  // Stats from state (already calculated in fetchData)
  const pendingCount = stats.pending;
  const approvedCount = stats.approved;
  const rejectedCount = stats.rejected;

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setModal({ open: true, requestId: id, action });
      setComment('');
      setCommentError('');
    }
  };

  const handleModalSubmit = async () => {
    if (!comment.trim()) {
      setCommentError('Comment is required.');
      return;
    }
    
    if (!modal.requestId || !modal.action) return;
    
    try {
      let response;
      
      if (modal.action === 'approve') {
        response = await apiService.approveEventPlanAsServiceProvider(modal.requestId, {
          comment: comment,
          signature_data: null // You can implement signature capture here
        });
      } else {
        response = await apiService.rejectEventPlanAsServiceProvider(modal.requestId, {
          comment: comment
        });
      }
      
      if (response.success) {
        console.log('✅ API response successful:', response);
        
        // Update local state immediately for better UX
        setRequests(prev => {
          const updated = prev.map(r => 
            r.id === modal.requestId 
              ? { ...r, status: modal.action === 'approve' ? 'approved' : 'rejected' } 
              : r
          );
          console.log('🔄 Updated local state:', updated);
          return updated;
        });
      
        // Show success message
        const message = modal.action === 'approve' 
            ? `Event plan approved successfully. Notification sent to Super-Admin.`
            : `Event plan rejected successfully. Notification sent to Super-Admin.`;
          
          toast.success(message);
          
          // Log notification details
          console.log(`📧 Super-Admin notification sent for ${modal.action} action on event plan ID: ${modal.requestId}`);
          console.log(`Service Provider Comment: ${comment}`);
          
          // Close modal
        setModal({ open: false, requestId: null, action: null });
        setComment('');
          
          // Refresh data after a short delay to ensure backend has processed the update
          setTimeout(() => {
            console.log('🔄 Refreshing data after status update...');
            fetchData();
          }, 1000);
        } else {
        toast.error(response.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Error processing request. Please try again.');
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
        {notifications.filter(n => n.status === 'unread').length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
            {notifications.filter(n => n.status === 'unread').length}
          </span>
        )}
      </button>
      {showNotif && (
        <div id="notifications" className="absolute right-0 top-10 w-80 bg-black bg-opacity-90 shadow-lg rounded-lg p-4 z-20 animate-fade-in">
          <h4 className="font-semibold mb-2 text-white">Recent Notifications</h4>
          <ul className="space-y-2">
            {notifications.slice(0, 5).map(n => (
              <li key={n.id} className="text-sm text-white">
                <div className="font-medium">{n.title}</div>
                <div className="text-gray-300">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Layout notificationBell={notificationBell}>
  <div className="min-h-screen w-full" style={{ backgroundColor: '#bd7880' }}>
        {/* Header */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Welcome Section */}
                <div className="bg-black/30 backdrop-blur-sm text-white rounded-2xl py-12 px-8 shadow-xl border border-white/10 w-full mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold mb-2">
                        Welcome, {user?.name}!
                      </h1>
                      <p className="text-white/90 text-lg font-semibold">
                        Manage event planning service requests and approvals
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center border border-white/10">
                        <ClipboardList size={48} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-black/40 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-white/70 text-sm">Pending Requests</p>
                    <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  </div>
                  </div>
                </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-black/40 rounded-lg">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
              </div>
                <div className="ml-4">
                  <p className="text-white/70 text-sm">Forwarded</p>
                  <p className="text-2xl font-bold text-white">{stats.forwarded}</p>
                  </div>
                </div>
              </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-black/40 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                <div className="ml-4">
                  <p className="text-white/70 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-white">{approvedCount}</p>
                  </div>
                </div>
              </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-black/40 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                <div className="ml-4">
                  <p className="text-white/70 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-white">{rejectedCount}</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Event Planning Requests */}
          <div className="bg-black bg-opacity-40 rounded-xl shadow-none p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Event Planning Requests</h2>
            </div>
                    
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
                <p className="text-white mt-4">Loading event planning requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-white text-lg">No pending event planning requests</p>
                <p className="text-gray-400 mt-2">All requests have been processed or new requests will appear here when forwarded by Super-Admin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests
                  .map((request) => (
                  <div key={request.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">{request.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                              request.status === 'forwarded_to_service_provider' ? 'bg-blue-500/20 text-blue-400' :
                              request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {request.status === 'submitted' ? 'Pending' : 
                               request.status === 'forwarded_to_service_provider' ? 'Forwarded' :
                               request.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                            {request.status === 'forwarded_to_service_provider' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                From Super-Admin
                              </span>
                            )}
                          </div>
                    </div>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Organizer:</span>
                            <span className="text-white ml-2">{request.organizer}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Date:</span>
                            <span className="text-white ml-2">{request.date}</span>
                          </div>
                    <div>
                            <span className="text-gray-400">Participants:</span>
                            <span className="text-white ml-2">{request.participants}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white ml-2">{request.type}</span>
                      </div>
                    </div>
                    
                        {request.facilities && Array.isArray(request.facilities) && request.facilities.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">Required Services:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {request.facilities.map((facility, index) => (
                                <span key={index} className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded text-xs">
                                  {facility}
                                </span>
                ))}
              </div>
            </div>
                        )}
                        
                        {request.remarks && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">Remarks:</span>
                            <p className="text-white text-sm mt-1">{request.remarks}</p>
                    </div>
                        )}
                    </div>
                      
                      {(request.status === 'submitted' || request.status === 'forwarded_to_service_provider') && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleAction(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <BadgeCheck className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                    </div>
                      )}
                    </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

        {/* Action Modal */}
        <Dialog open={modal.open} onOpenChange={(open) => setModal({ ...modal, open })}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {modal.action === 'approve' ? 'Approve' : 'Reject'} Event Plan
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comment (Required)
              </label>
              <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                  placeholder={`Enter your ${modal.action === 'approve' ? 'approval' : 'rejection'} comment...`}
                />
                {commentError && (
                  <p className="text-red-400 text-sm mt-1">{commentError}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setModal({ open: false, requestId: null, action: null })}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleModalSubmit}
                className={`${
                  modal.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {modal.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  </Layout>
  );
};

export default ServiceProviderDashboard;
