
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  CheckCircle, 
  X, 
  Edit, 
  Trash, 
  Search,
  Filter,
  Eye,
  Download,
  UserPlus,
  Bell
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'service-provider' | 'super-admin' | 'vice-chancellor' | 'administration' | 'student-union' | 'warden';
  status: 'active' | 'inactive';
  joinDate: string;
}

interface PendingApproval {
  id: string;
  type: 'booking' | 'event-plan';
  title: string;
  requester: string;
  requestedBy: string;
  venue: string;
  date: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalLetters?: {
    vc: string;
    admin: string;
    warden: string;
    studentUnion: string;
  };
}

const AdminTools: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'logs' | 'notifications'>('users');
  const [approvalQueueTab, setApprovalQueueTab] = useState<'venue-booking' | 'event-planning'>('venue-booking');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectionApproval, setSelectedRejectionApproval] = useState<PendingApproval | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rejectionEmail, setRejectionEmail] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApproveApproval, setSelectedApproveApproval] = useState<PendingApproval | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalEmail, setApprovalEmail] = useState('');
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedViewApproval, setSelectedViewApproval] = useState<PendingApproval | null>(null);
  const [forwardedLetters, setForwardedLetters] = useState<{[key: string]: boolean}>({});
  const [signedLetters, setSignedLetters] = useState<{[key: string]: string}>({});
  const [notifications, setNotifications] = useState([
    // Service Provider Notifications
    {
      id: 1,
      type: 'approval',
      source: 'service-provider',
      authority: 'Audio Visual Services',
      eventName: 'Research Conference 2025',
      comment: 'All requested services are available. Projector and audio system will be set up 2 hours before the event. Lighting system requires additional setup time.',
      timestamp: '2025-01-15 14:30:00',
      status: 'unread'
    },
    {
      id: 2,
      type: 'rejection',
      source: 'service-provider',
      authority: 'Catering Services',
      eventName: 'University Cultural Festival',
      comment: 'Unable to provide catering services for 500 participants on the requested date. Kitchen capacity limited. Suggest alternative date or reduced menu.',
      timestamp: '2025-01-15 13:45:00',
      status: 'read'
    },
    {
      id: 3,
      type: 'approval',
      source: 'service-provider',
      authority: 'Security Services',
      eventName: 'Tech Innovation Summit',
      comment: 'Security services approved. Will provide 4 security personnel for the event. Additional crowd control measures recommended.',
      timestamp: '2025-01-15 12:15:00',
      status: 'unread'
    },
    // Authority Notifications
    {
      id: 4,
      type: 'approval',
      source: 'authority',
      authority: 'Vice Chancellor',
      eventName: 'Research Conference 2025',
      comment: 'Event approved by Vice Chancellor. All academic requirements met. Research conference aligns with university objectives.',
      timestamp: '2025-01-15 11:30:00',
      status: 'unread'
    },
    {
      id: 5,
      type: 'rejection',
      source: 'authority',
      authority: 'Warden',
      eventName: 'University Cultural Festival',
      comment: 'Event rejected by Warden. Venue capacity concerns for 500 participants. Safety protocols need revision.',
      timestamp: '2025-01-15 10:45:00',
      status: 'unread'
    },
    {
      id: 6,
      type: 'approval',
      source: 'authority',
      authority: 'University Administration',
      eventName: 'Tech Innovation Summit',
      comment: 'Event approved by University Administration. Budget allocation confirmed. Administrative support will be provided.',
      timestamp: '2025-01-15 09:15:00',
      status: 'read'
    },
    {
      id: 7,
      type: 'approval',
      source: 'authority',
      authority: 'Student Union',
      eventName: 'University Cultural Festival',
      comment: 'Event approved by Student Union. Student participation confirmed. Cultural activities align with student interests.',
      timestamp: '2025-01-15 08:30:00',
      status: 'unread'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Roy',
      email: 'superadmin@university.edu',
      role: 'super-admin',
      status: 'active',
      joinDate: '2025-01-01'
    },
    {
      id: '2',
      name: 'Shalini Weerathunga',
      email: 'shalini@university.edu',
      role: 'student',
      status: 'active',
      joinDate: '2025-02-17'
    },
    {
      id: '3',
      name: 'Prof. K.M.D.S. Perera',
      email: 'perera@university.edu',
      role: 'faculty',
      status: 'active',
      joinDate: '2025-03-15'
    },
    {
      id: '4',
      name: 'Nishantha Nanayakara',
      email: 'nishantha@university.edu',
      role: 'student',
      status: 'inactive',
      joinDate: '2025-06-01'
    }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    // Venue Booking Requests
    {
      id: '1',
      type: 'booking',
      title: 'Research Conference 2025',
      requester: 'Chamali Kumari',
      requestedBy: 'chamali@university.edu',
      venue: 'Main Lecture Theater-MLT',
      date: '2025-05-20',
      details: 'Annual research conference with 200 participants',
      status: 'pending'
    },
    {
      id: '2',
      type: 'booking',
      title: 'Tech Talk 2025',
      requester: 'Diluksha Perera',
      requestedBy: 'diluksha@university.edu',
      venue: 'Technology Lecture Theater',
      date: '2025-07-15',
      details: 'Technology seminar with 150 participants',
      status: 'pending'
    },
    {
      id: '3',
      type: 'booking',
      title: 'Alumni Meetup',
      requester: 'Suresh Kumar',
      requestedBy: 'suresh@university.edu',
      venue: 'E Block Main Auditorium',
      date: '2025-08-10',
      details: 'Annual alumni gathering with 300 participants',
      status: 'pending'
    },
    // Event Planning Requests
    {
      id: '4',
      type: 'event-plan',
      title: 'Social Night',
      requester: 'Student Union',
      requestedBy: 'SU@university.edu',
      venue: 'Open Ground',
      date: '2025-06-20',
      details: 'Annual social night event with 1000 participants',
      status: 'pending',
      approvalLetters: {
        vc: 'vc_approval_letter.pdf',
        admin: 'admin_approval_letter.pdf',
        warden: 'warden_approval_letter.pdf',
        studentUnion: 'su_approval_letter.pdf'
      }
    },
    {
      id: '5',
      type: 'event-plan',
      title: 'Cultural Festival',
      requester: 'Cultural Society',
      requestedBy: 'cultural@university.edu',
      venue: 'Open Ground',
      date: '2025-04-15',
      details: 'Cultural event with stage performances and food stalls',
      status: 'pending',
      approvalLetters: {
        vc: 'vc_approval_letter.pdf',
        admin: 'admin_approval_letter.pdf',
        warden: 'warden_approval_letter.pdf',
        studentUnion: 'su_approval_letter.pdf'
      }
    },
    {
      id: '6',
      type: 'event-plan',
      title: 'Sports Fiesta',
      requester: 'Sports Club',
      requestedBy: 'sports@university.edu',
      venue: 'Sports Complex',
      date: '2025-09-05',
      details: 'Annual sports competition with 500 participants',
      status: 'pending',
      approvalLetters: {
        vc: 'vc_approval_letter.pdf',
        admin: 'admin_approval_letter.pdf',
        warden: 'warden_approval_letter.pdf',
        studentUnion: 'su_approval_letter.pdf'
      }
    },
    {
      id: '7',
      type: 'event-plan',
      title: 'Music Night',
      requester: 'Music Society',
      requestedBy: 'music@university.edu',
      venue: 'Open Air Theater',
      date: '2025-10-12',
      details: 'Live music performance with 800 participants',
      status: 'pending',
      approvalLetters: {
        vc: 'vc_approval_letter.pdf',
        admin: 'admin_approval_letter.pdf',
        warden: 'warden_approval_letter.pdf',
        studentUnion: 'su_approval_letter.pdf'
      }
    }
  ]);

  const systemLogs = [
    {
      id: '1',
      timestamp: '2025-05-20 10:30:00',
      user: 'Chamali Kumari',
      action: 'Booking Created',
      target: 'Research Conference 2025',
      details: 'Created new booking for Main Lecture Theater-MLT'
    },
    {
      id: '2',
      timestamp: '2025-06-01 09:15:00',
      user: 'Admin',
      action: 'User Status Changed',
      target: 'Nishantha Nanayakara',
      details: 'Changed user status from active to inactive'
    },
    {
      id: '3',
      timestamp: '2024-01-14 16:45:00',
      user: 'Prof.K.M.D.S. Perera',
      action: 'Event Plan Submitted',
      target: 'InnoveX Seminar',
      details: 'Submitted event plan for review'
    }
  ];

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as User['role'],
    status: 'active' as User['status']
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'approvals' || tab === 'users' || tab === 'logs') {
      setActiveTab(tab as 'users' | 'approvals' | 'logs');
    }
  }, [location.search]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleApproval = (approvalId: string, action: 'approve' | 'reject') => {
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (!approval) return;

    if (action === 'reject') {
      setSelectedRejectionApproval(approval);
      setRejectionEmail(approval.requestedBy);
      setShowRejectModal(true);
    } else {
      setSelectedApproveApproval(approval);
      setApprovalEmail(approval.requestedBy);
      setShowApproveModal(true);
    }
  };

  const handleRejectWithComment = () => {
    if (!rejectionComment.trim()) {
      alert('Please provide a rejection comment.');
      return;
    }

    if (selectedRejectionApproval) {
      // Update the approval status
      setPendingApprovals(pendingApprovals.map(approval => 
        approval.id === selectedRejectionApproval.id 
          ? { ...approval, status: 'rejected' }
          : approval
      ));

      // Simulate sending email notification
      console.log(`Rejection email sent to: ${rejectionEmail}`);
      console.log(`Rejection comment: ${rejectionComment}`);
      console.log(`Request details: ${selectedRejectionApproval.title}`);

      // Show success message
      alert(`Rejection notification sent to ${rejectionEmail}`);

      // Reset modal state
      setShowRejectModal(false);
      setSelectedRejectionApproval(null);
      setRejectionComment('');
      setRejectionEmail('');
    }
  };

  const handleApproveWithComment = () => {
    if (selectedApproveApproval) {
      // Update the approval status
      setPendingApprovals(pendingApprovals.map(approval => 
        approval.id === selectedApproveApproval.id 
          ? { ...approval, status: 'approved' }
          : approval
      ));

      // Simulate sending email notification
      console.log(`Approval email sent to: ${approvalEmail}`);
      console.log(`Approval comment: ${approvalComment}`);
      console.log(`Request details: ${selectedApproveApproval.title}`);
      
      if (selectedApproveApproval.type === 'event-plan') {
        console.log(`Event planning approval for: ${selectedApproveApproval.title}`);
        console.log(`Approval letters: ${selectedApproveApproval.approvalLetters ? Object.keys(selectedApproveApproval.approvalLetters).join(', ') : 'None'}`);
      }

      // Show success message
      const message = selectedApproveApproval.type === 'event-plan' 
        ? `Event planning approval notification sent to ${approvalEmail}`
        : `Approval notification sent to ${approvalEmail}`;
      alert(message);

      // Reset modal state
      setShowApproveModal(false);
      setSelectedApproveApproval(null);
      setApprovalComment('');
      setApprovalEmail('');
    }
  };

  const handleViewDetails = (approval: PendingApproval) => {
    setSelectedViewApproval(approval);
    setShowViewDetailsModal(true);
  };

  const handleForwardLetter = (letterType: string) => {
    if (selectedViewApproval) {
      setForwardedLetters(prev => ({
        ...prev,
        [`${selectedViewApproval.id}-${letterType}`]: true
      }));
      
      // Simulate forwarding to respective dashboard
      const dashboardMap: {[key: string]: string} = {
        vc: 'Vice Chancellor',
        admin: 'University Administration',
        warden: 'Warden',
        studentUnion: 'Student Union'
      };
      
      console.log(`Letter forwarded to ${dashboardMap[letterType]} dashboard`);
      alert(`Letter forwarded to ${dashboardMap[letterType]} dashboard`);
    }
  };

  const handleUploadSignedLetter = (letterType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedViewApproval) {
        setSignedLetters(prev => ({
          ...prev,
          [`${selectedViewApproval.id}-${letterType}`]: file.name
        }));
        alert(`Signed letter uploaded for ${letterType.toUpperCase()}`);
      }
    };
    input.click();
  };

  const handleSendToUser = () => {
    if (selectedViewApproval) {
      const uploadedCount = Object.keys(signedLetters).filter(key => 
        key.startsWith(selectedViewApproval.id)
      ).length;
      
      if (uploadedCount === 4) {
        alert(`All signed letters sent to ${selectedViewApproval.requestedBy}`);
        console.log(`Signed letters sent to user: ${selectedViewApproval.requestedBy}`);
      } else {
        alert(`Please upload all 4 signed letters before sending to user`);
      }
    }
  };

  const handleForwardToServiceProvider = () => {
    if (selectedViewApproval) {
      // Simulate forwarding event planning request to Service Provider Dashboard
      console.log(`Event planning request forwarded to Service Provider Dashboard`);
      console.log(`Event: ${selectedViewApproval.title}`);
      console.log(`Services: ${selectedViewApproval.approvalLetters ? Object.keys(selectedViewApproval.approvalLetters).join(', ') : 'N/A'}`);
      alert(`Event planning request forwarded to Service Provider Dashboard for service approval`);
    }
  };

  const handleServiceProviderNotification = (eventName: string, serviceProvider: string, comment: string, type: 'approval' | 'rejection') => {
    const newNotification = {
      id: Date.now(),
      type,
      source: 'service-provider',
      authority: serviceProvider,
      eventName,
      comment,
      timestamp: new Date().toLocaleString(),
      status: 'unread' as const
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    console.log(`Service provider notification received: ${type} for ${eventName} from ${serviceProvider}`);
  };

  const handleAuthorityNotification = (eventName: string, authority: string, comment: string, type: 'approval' | 'rejection') => {
    const newNotification = {
      id: Date.now(),
      type,
      source: 'authority',
      authority,
      eventName,
      comment,
      timestamp: new Date().toLocaleString(),
      status: 'unread' as const
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    console.log(`Authority notification received: ${type} for ${eventName} from ${authority}`);
  };

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' }
          : notification
      )
    );
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...editingUser, ...newUser }
          : user
      ));
    } else {
      // Add new user
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
    }
    
    setShowUserForm(false);
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'student', status: 'active' });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'service-provider':
        return 'bg-orange-100 text-orange-800';
      case 'vice-chancellor':
        return 'bg-indigo-100 text-indigo-800';
      case 'administration':
        return 'bg-teal-100 text-teal-800';
      case 'student-union':
        return 'bg-pink-100 text-pink-800';
      case 'warden':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={() => setShowUserForm(true)}
          className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center hover:bg-white/20 transition-colors border border-white/20"
        >
          <UserPlus size={20} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Roles</option>
              <optgroup label="Public Roles">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </optgroup>
              <optgroup label="Authority Roles">
                <option value="super-admin">Super Admin</option>
                <option value="service-provider">Service Provider</option>
                <option value="vice-chancellor">Vice Chancellor</option>
                <option value="administration">Administration of UWU</option>
                <option value="student-union">Student Union</option>
                <option value="warden">Warden</option>
              </optgroup>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="bg-white/10 backdrop-blur-sm text-white w-full px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60 backdrop-blur-sm">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-white">User</th>
                <th className="text-left py-3 px-6 font-medium text-white">Role</th>
                <th className="text-left py-3 px-6 font-medium text-white">Status</th>
                <th className="text-left py-3 px-6 font-medium text-white">Join Date</th>
                <th className="text-left py-3 px-6 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-white/70">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    
                      user.role === 'super-admin' ? 'bg-red-900/60 text-red-200 border-red-500/30' :
                      user.role === 'faculty' ? 'bg-blue-900/60 text-blue-200 border-blue-500/30' :
                      user.role === 'student' ? 'bg-green-900/60 text-green-200 border-green-500/30' :
                      user.role === 'service-provider' ? 'bg-orange-900/60 text-orange-200 border-orange-500/30' :
                      user.role === 'vice-chancellor' ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/30' :
                      user.role === 'administration' ? 'bg-teal-900/60 text-teal-200 border-teal-500/30' :
                      user.role === 'student-union' ? 'bg-pink-900/60 text-pink-200 border-pink-500/30' :
                      user.role === 'warden' ? 'bg-yellow-900/60 text-yellow-200 border-yellow-500/30' :
                      'bg-gray-900/60 text-gray-200 border-gray-500/30'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.status === 'active' ? 'bg-green-900/60 text-green-200 border-green-500/30' : user.status === 'inactive' ? 'bg-red-900/60 text-red-200 border-red-500/30' : 'bg-yellow-900/60 text-yellow-200 border-yellow-500/30'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-white/70">
                    {user.joinDate}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-200 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`${user.status === 'active' ? 'text-red-400 hover:text-red-200' : 'text-green-400 hover:text-green-200'} transition-colors`}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-200 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApprovalsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Approval Queue</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-white/20">
        <button
          onClick={() => setApprovalQueueTab('venue-booking')}
          className={`px-4 py-2 font-medium transition-colors ${
            approvalQueueTab === 'venue-booking'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Approval Queue of Venue Booking
        </button>
        <button
          onClick={() => setApprovalQueueTab('event-planning')}
          className={`px-4 py-2 font-medium transition-colors ${
            approvalQueueTab === 'event-planning'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Approval Queue of Event Planning
        </button>
      </div>
      
      <div className="space-y-4">
        {pendingApprovals
          .filter(approval => 
            approval.status === 'pending' && 
            ((approvalQueueTab === 'venue-booking' && approval.type === 'booking') ||
             (approvalQueueTab === 'event-planning' && approval.type === 'event-plan'))
          )
          .map((approval) => (
          <div key={approval.id} className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${approval.type === 'booking' ? 'bg-blue-900/60 text-blue-200 border-blue-500/30' : 'bg-purple-900/60 text-purple-200 border-purple-500/30'}`}>{approval.type === 'booking' ? 'Booking Request' : 'Event Plan'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${approval.status === 'pending' ? 'bg-yellow-900/60 text-yellow-200 border-yellow-500/30' : approval.status === 'approved' ? 'bg-green-900/60 text-green-200 border-green-500/30' : 'bg-red-900/60 text-red-200 border-red-500/30'}`}>{approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{approval.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80 mb-3">
                  <div><span className="font-medium">Requester:</span> {approval.requester}</div>
                  <div><span className="font-medium">Email:</span> {approval.requestedBy}</div>
                  <div><span className="font-medium">Venue:</span> {approval.venue}</div>
                  <div><span className="font-medium">Date:</span> {approval.date}</div>
                </div>
                
                <p className="text-white/90 mb-4">{approval.details}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproval(approval.id, 'approve')}
                  className="bg-green-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center hover:bg-green-800/80 border border-green-500/30"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(approval.id, 'reject')}
                  className="bg-red-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center hover:bg-red-800/80 border border-red-500/30"
                >
                  <X size={16} className="mr-2" />
                  Reject
                </button>
                <button 
                  onClick={() => handleViewDetails(approval)}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium flex items-center hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show message when no pending requests */}
        {pendingApprovals
          .filter(approval => 
            approval.status === 'pending' && 
            ((approvalQueueTab === 'venue-booking' && approval.type === 'booking') ||
             (approvalQueueTab === 'event-planning' && approval.type === 'event-plan'))
          ).length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg font-medium">
              No pending {approvalQueueTab === 'venue-booking' ? 'venue booking' : 'event planning'} requests
            </div>
            <div className="text-white/40 text-sm mt-2">
              All requests in this queue have been processed
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Notifications</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/70">
            {notifications.filter(n => n.status === 'unread').length} unread
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto text-white/30" size={48} />
            <p className="text-white/50 mt-2">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-all hover:bg-black/60 ${
                notification.status === 'unread' ? 'border-blue-500/50 bg-blue-500/10' : ''
              }`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      notification.type === 'approval' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      notification.type === 'approval' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {notification.type === 'approval' ? 'Approval' : 'Rejection'}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      notification.source === 'service-provider' 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {notification.source === 'service-provider' ? 'Service Provider' : 'Authority'}
                    </span>
                    <span className="text-sm text-white/70">
                      {notification.authority}
                    </span>
                    {notification.status === 'unread' && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        New
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {notification.eventName}
                  </h4>
                  
                  <div className="text-sm text-white/90 mb-3">
                    <p className="mb-1">
                      <span className="font-medium">{notification.source === 'service-provider' ? 'Service Provider' : 'Authority'}:</span> {notification.authority}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Event:</span> {notification.eventName}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Time:</span> {notification.timestamp}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">
                      {notification.source === 'service-provider' ? 'Service Provider' : 'Authority'} Comment:
                    </h5>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {notification.comment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-white">System Logs</h2>
        <button className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center hover:bg-white/20 transition-colors border border-white/20">
          <Download size={20} className="mr-2" />
          Export Logs
        </button>
      </div>
      
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60 backdrop-blur-sm">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-white">Timestamp</th>
                <th className="text-left py-3 px-6 font-medium text-white">User</th>
                <th className="text-left py-3 px-6 font-medium text-white">Action</th>
                <th className="text-left py-3 px-6 font-medium text-white">Target</th>
                <th className="text-left py-3 px-6 font-medium text-white">Details</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log) => (
                <tr key={log.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm text-white/70">{log.timestamp}</td>
                  <td className="py-4 px-6 font-medium text-white">{log.user}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded border border-white/20 hover:bg-white/20 transition-colors">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-white/70">{log.target}</td>
                  <td className="py-4 px-6 text-sm text-white/70">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen w-full flex flex-col items-stretch" style={{ backgroundColor: '#bd7880' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8 animate-fade-in text-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white">Admin Tools</h1>
              <p className="text-lg text-white/90">Manage users, approvals, and system activities</p>
            </div>

            {/* Tabs */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
              <div className="border-b border-white/10">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'users', name: 'User Management', icon: Users },
                    { id: 'approvals', name: 'Approvals Queue', icon: CheckCircle },
                    { id: 'notifications', name: 'Notifications', icon: Bell },
                    { id: 'logs', name: 'System Logs', icon: Eye }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-white'
                          : 'border-transparent text-white/70 hover:text-blue-300 hover:border-blue-300'
                      }`}
                    >
                      <tab.icon size={20} className="mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'users' && renderUsersTab()}
                {activeTab === 'approvals' && renderApprovalsTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'logs' && renderLogsTab()}
              </div>
            </div>

            {/* User Form Modal */}
            {showUserForm && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-black/90 backdrop-blur-sm rounded-2xl max-w-md w-full text-white border border-white/10 shadow-2xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {editingUser ? 'Edit User' : 'Add New User'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                          setNewUser({ name: '', email: '', role: 'student', status: 'active' });
                        }}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Role
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                          className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {/* Public Roles */}
                          <optgroup label="Public Roles">
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                          </optgroup>
                          
                          {/* Authority Roles */}
                          <optgroup label="Authority Roles">
                            <option value="service-provider">Service Provider</option>
                            <option value="super-admin">Super Admin</option>
                            <option value="vice-chancellor">Vice Chancellor</option>
                            <option value="administration">Administration of UWU</option>
                            <option value="student-union">Student Union</option>
                            <option value="warden">Warden</option>
                          </optgroup>
                        </select>
                        <p className="mt-1 text-xs text-gray-400">
                          Public roles can self-register. Authority roles require admin creation.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Status
                        </label>
                        <select
                          value={newUser.status}
                          onChange={(e) => setNewUser({...newUser, status: e.target.value as User['status']})}
                          className="bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserForm(false);
                            setEditingUser(null);
                            setNewUser({ name: '', email: '', role: 'student', status: 'active' });
                          }}
                          className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                        >
                          {editingUser ? 'Update User' : 'Add User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* View Details Modal */}
            {showViewDetailsModal && selectedViewApproval && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-black bg-opacity-90 rounded-xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl font-bold"
                    onClick={() => {
                      setShowViewDetailsModal(false);
                      setSelectedViewApproval(null);
                    }}
                  >
                    ×
                  </button>
                  
                  <h3 className="text-2xl font-bold mb-6 text-white">Event Planning Request Details</h3>
                  
                  {/* Event Details Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Event Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/60 rounded-lg p-4">
                        <div className="mb-3">
                          <span className="font-medium text-white">Event Title:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.title}</div>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium text-white">Requester:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.requester}</div>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium text-white">Email:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.requestedBy}</div>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium text-white">Venue:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.venue}</div>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium text-white">Date:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.date}</div>
                        </div>
                        <div>
                          <span className="font-medium text-white">Description:</span>
                          <div className="text-white/90 mt-1">{selectedViewApproval.details}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/60 rounded-lg p-4">
                        <h5 className="font-medium text-white mb-3">Services Requested</h5>
                        <div className="space-y-2">
                          <div className="flex items-center text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Projector & Audio System
                          </div>
                          <div className="flex items-center text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Stage Setup
                          </div>
                          <div className="flex items-center text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Lighting System
                          </div>
                          <div className="flex items-center text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Security Services
                          </div>
                          <div className="flex items-center text-white/90">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Catering Services
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approval Letters Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Approval Letters Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedViewApproval.approvalLetters && Object.entries(selectedViewApproval.approvalLetters).map(([letterType, fileName]) => {
                        const isForwarded = forwardedLetters[`${selectedViewApproval.id}-${letterType}`];
                        const signedLetter = signedLetters[`${selectedViewApproval.id}-${letterType}`];
                        const dashboardNames: {[key: string]: string} = {
                          vc: 'Vice Chancellor',
                          admin: 'University Administration',
                          warden: 'Warden',
                          studentUnion: 'Student Union'
                        };
                        
                        return (
                          <div key={letterType} className="bg-gray-800/60 rounded-lg p-4">
                            <h5 className="font-medium text-white mb-3">{dashboardNames[letterType]} Approval</h5>
                            
                            <div className="mb-3">
                              <span className="text-sm text-white/70">Submitted Letter:</span>
                              <div className="text-blue-300 text-sm mt-1">{fileName}</div>
                            </div>
                            
                            <div className="space-y-2">
                              {!isForwarded ? (
                                <button
                                  onClick={() => handleForwardLetter(letterType)}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                  Forward to {dashboardNames[letterType]} Dashboard
                                </button>
                              ) : (
                                <div className="text-green-400 text-sm mb-2">✓ Forwarded to {dashboardNames[letterType]}</div>
                              )}
                              
                              {isForwarded && !signedLetter && (
                                <button
                                  onClick={() => handleUploadSignedLetter(letterType)}
                                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                  Upload Signed Letter
                                </button>
                              )}
                              
                              {signedLetter && (
                                <div className="text-green-400 text-sm">
                                  ✓ Signed letter uploaded: {signedLetter}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Service Provider Forwarding Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Service Provider Coordination</h4>
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white mb-2">Forward to Service Provider Dashboard</h5>
                          <p className="text-white/70 text-sm">
                            Send event planning request with all service details to Service Provider for approval
                          </p>
                        </div>
                        <button
                          onClick={handleForwardToServiceProvider}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                        >
                          Forward to Service Provider
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Send to User Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">Final Action</h4>
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white mb-2">Send All Signed Letters to User</h5>
                          <p className="text-white/70 text-sm">
                            Upload all 4 signed letters to send them to {selectedViewApproval.requestedBy}
                          </p>
                        </div>
                        <button
                          onClick={handleSendToUser}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                        >
                          Send to User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Modal */}
            {showApproveModal && selectedApproveApproval && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-black bg-opacity-90 rounded-xl shadow-xl p-8 w-full max-w-lg relative">
                  <button
                    className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl font-bold"
                    onClick={() => {
                      setShowApproveModal(false);
                      setSelectedApproveApproval(null);
                      setApprovalComment('');
                      setApprovalEmail('');
                    }}
                  >
                    ×
                  </button>
                  
                  <h3 className="text-lg font-bold mb-4 text-white">
                    {selectedApproveApproval.type === 'event-plan' ? 'Approve Event Planning Request' : 'Approve Request'}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="font-semibold text-white">Request Details:</span>
                    <div className="border border-gray-600 rounded-md mt-2 p-3 bg-gray-800/60 text-white">
                      <div className="mb-2">
                        <span className="font-medium">Title:</span> {selectedApproveApproval.title}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Requester:</span> {selectedApproveApproval.requester}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Venue:</span> {selectedApproveApproval.venue}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Date:</span> {selectedApproveApproval.date}
                      </div>
                      {selectedApproveApproval.type === 'event-plan' && selectedApproveApproval.approvalLetters && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <span className="font-medium text-green-300">Approval Letters Submitted:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(selectedApproveApproval.approvalLetters).map(([letterType, fileName]) => (
                              <div key={letterType} className="text-sm text-gray-300">
                                • {letterType === 'vc' ? 'Vice Chancellor' : 
                                   letterType === 'admin' ? 'University Administration' :
                                   letterType === 'warden' ? 'Warden' : 'Student Union'}: {fileName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-semibold mb-1 text-white">Email Notification:</label>
                    <input
                      type="email"
                      value={approvalEmail}
                      onChange={(e) => setApprovalEmail(e.target.value)}
                      className="w-full border border-gray-600 rounded-md p-2 bg-gray-800/60 text-white placeholder-gray-300"
                      placeholder="Email address for notification"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This email will receive the approval notification
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block font-semibold mb-1 text-white">Approval Comment (Optional):</label>
                    <textarea
                      className="w-full border border-gray-600 rounded-md p-3 bg-gray-800/60 text-white placeholder-gray-300"
                      rows={4}
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      placeholder={selectedApproveApproval.type === 'event-plan' 
                        ? "Add comments about services requested, approval letters, or any special instructions..." 
                        : "Add any additional comments or instructions..."}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedApproveApproval.type === 'event-plan' 
                        ? "This comment will be included in the email notification about your event planning approval"
                        : "This comment will be included in the email notification"}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowApproveModal(false);
                        setSelectedApproveApproval(null);
                        setApprovalComment('');
                        setApprovalEmail('');
                      }}
                      className="bg-gray-700/80 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApproveWithComment}
                      className="bg-green-700/80 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold transition-colors flex items-center"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Send Approval
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedRejectionApproval && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-black bg-opacity-90 rounded-xl shadow-xl p-8 w-full max-w-lg relative">
                  <button
                    className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl font-bold"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedRejectionApproval(null);
                      setRejectionComment('');
                      setRejectionEmail('');
                    }}
                  >
                    ×
                  </button>
                  
                  <h3 className="text-lg font-bold mb-4 text-white">Reject Request</h3>
                  
                  <div className="mb-4">
                    <span className="font-semibold text-white">Request Details:</span>
                    <div className="border border-gray-600 rounded-md mt-2 p-3 bg-gray-800/60 text-white">
                      <div className="mb-2">
                        <span className="font-medium">Title:</span> {selectedRejectionApproval.title}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Requester:</span> {selectedRejectionApproval.requester}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Venue:</span> {selectedRejectionApproval.venue}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {selectedRejectionApproval.date}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-semibold mb-1 text-white">Email Notification:</label>
                    <input
                      type="email"
                      value={rejectionEmail}
                      onChange={(e) => setRejectionEmail(e.target.value)}
                      className="w-full border border-gray-600 rounded-md p-2 bg-gray-800/60 text-white placeholder-gray-300"
                      placeholder="Email address for notification"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This email will receive the rejection notification
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block font-semibold mb-1 text-white">Rejection Comment <span className="text-red-500">*</span></label>
                    <textarea
                      className="w-full border border-gray-600 rounded-md p-3 bg-gray-800/60 text-white placeholder-gray-300"
                      rows={4}
                      value={rejectionComment}
                      onChange={(e) => setRejectionComment(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This comment will be included in the email notification
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setSelectedRejectionApproval(null);
                        setRejectionComment('');
                        setRejectionEmail('');
                      }}
                      className="bg-gray-700/80 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectWithComment}
                      className="bg-red-700/80 hover:bg-red-600 text-white px-6 py-2 rounded font-semibold transition-colors flex items-center"
                    >
                      <X size={16} className="mr-2" />
                      Send Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminTools;
