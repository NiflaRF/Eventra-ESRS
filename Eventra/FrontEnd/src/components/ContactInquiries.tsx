import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, Reply, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  replied_by?: number;
  reply_message?: string;
  replied_at?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

interface ContactInquiriesProps {
  onClose?: () => void;
}

const ContactInquiries: React.FC<ContactInquiriesProps> = ({ onClose }) => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContactMessages(
        filter === 'all' ? {} : { status: filter }
      );
      
      if (response.success && response.data) {
        setContacts(response.data);
      } else {
        setNotification({ type: 'error', message: 'Failed to fetch contact messages' });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setNotification({ type: 'error', message: 'An error occurred while fetching contact messages' });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      setIsReplying(true);
      const response = await apiService.replyToContact(selectedContact.id, replyMessage);
      
      if (response.success) {
        setNotification({ type: 'success', message: 'Reply sent successfully!' });
        setReplyMessage('');
        setSelectedContact(null);
        await fetchContacts(); // Refresh the list
      } else {
        setNotification({ type: 'error', message: response.message || 'Failed to send reply' });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setNotification({ type: 'error', message: 'An error occurred while sending the reply' });
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusUpdate = async (contactId: number, newStatus: string) => {
    try {
      const response = await apiService.updateContactStatus(contactId, newStatus);
      
      if (response.success) {
        setNotification({ type: 'success', message: 'Status updated successfully!' });
        await fetchContacts(); // Refresh the list
      } else {
        setNotification({ type: 'error', message: response.message || 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ type: 'error', message: 'An error occurred while updating the status' });
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;

    try {
      const response = await apiService.deleteContactMessage(contactId);
      
      if (response.success) {
        setNotification({ type: 'success', message: 'Contact message deleted successfully!' });
        await fetchContacts(); // Refresh the list
        if (selectedContact && selectedContact.id === contactId) {
          setSelectedContact(null);
        }
      } else {
        setNotification({ type: 'error', message: response.message || 'Failed to delete contact message' });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      setNotification({ type: 'error', message: 'An error occurred while deleting the contact message' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'text-red-300 bg-red-900 bg-opacity-50 border border-red-500/30';
      case 'read': return 'text-blue-300 bg-blue-900 bg-opacity-50 border border-blue-500/30';
      case 'replied': return 'text-green-300 bg-green-900 bg-opacity-50 border border-green-500/30';
      case 'archived': return 'text-gray-300 bg-gray-800 bg-opacity-50 border border-gray-500/30';
      default: return 'text-gray-300 bg-gray-800 bg-opacity-50 border border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-900 bg-opacity-50 border border-red-500/30';
      case 'medium': return 'text-yellow-300 bg-yellow-900 bg-opacity-50 border border-yellow-500/30';
      case 'low': return 'text-green-300 bg-green-900 bg-opacity-50 border border-green-500/30';
      default: return 'text-gray-300 bg-gray-800 bg-opacity-50 border border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="w-4 h-4" />;
      case 'read': return <Eye className="w-4 h-4" />;
      case 'replied': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Clock className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-black bg-opacity-60 backdrop-blur-sm text-white p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Mail className="w-6 h-6" />
                Contact Inquiries
              </h2>
              <p className="text-gray-300 mt-1">Manage and respond to customer inquiries</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 text-white text-center ${
            notification.type === 'success' ? 'bg-green-600 bg-opacity-80' : 'bg-red-600 bg-opacity-80'
          }`}>
            {notification.message}
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-300"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex h-full">
          {/* Contact List */}
          <div className="w-1/2 border-r border-white/20">
            {/* Filter Tabs */}
            <div className="p-4 border-b border-white/20 bg-gray-900 bg-opacity-50">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'read', label: 'Read' },
                  { key: 'replied', label: 'Replied' },
                  { key: 'archived', label: 'Archived' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      filter === tab.key
                        ? 'bg-white bg-opacity-20 text-white border border-white/30'
                        : 'bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact List */}
            <div className="overflow-y-auto bg-black bg-opacity-40" style={{ height: 'calc(100% - 80px)' }}>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p>No contact messages found</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      if (contact.status === 'unread') {
                        handleStatusUpdate(contact.id, 'read');
                      }
                    }}
                    className={`p-4 border-b border-white/10 cursor-pointer hover:bg-gray-800 hover:bg-opacity-30 ${
                      selectedContact?.id === contact.id ? 'bg-gray-700 bg-opacity-50 border-white/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{contact.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(contact.status)}`}>
                          {getStatusIcon(contact.status)}
                          {contact.status}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                        {contact.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{contact.email}</p>
                    <p className="text-sm text-gray-200 line-clamp-2 mb-2">
                      {contact.message.length > 100 
                        ? contact.message.substring(0, 100) + '...'
                        : contact.message
                      }
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(contact.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="w-1/2 flex flex-col bg-black bg-opacity-30">
            {selectedContact ? (
              <>
                {/* Contact Header */}
                <div className="p-6 border-b border-white/20 bg-gray-900 bg-opacity-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedContact.name}</h3>
                      <p className="text-gray-300">{selectedContact.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedContact.status}
                        onChange={(e) => handleStatusUpdate(selectedContact.id, e.target.value)}
                        className="px-3 py-1 border border-white/20 rounded text-sm bg-gray-800 bg-opacity-70 text-white"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={() => handleDelete(selectedContact.id)}
                        className="p-2 text-red-400 hover:bg-red-600 hover:bg-opacity-20 rounded"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Received: {formatDate(selectedContact.created_at)}</span>
                    <span className={`px-2 py-1 rounded-full ${getPriorityColor(selectedContact.priority)}`}>
                      {selectedContact.priority} priority
                    </span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-2">Original Message:</h4>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-white/10">
                      <p className="text-gray-200 whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                  </div>

                  {selectedContact.reply_message && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-white mb-2">Previous Reply:</h4>
                      <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="text-gray-200 whitespace-pre-wrap">{selectedContact.reply_message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Sent: {selectedContact.replied_at ? formatDate(selectedContact.replied_at) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Reply className="w-4 h-4" />
                      Send Reply:
                    </h4>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={6}
                      className="w-full border border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleReply}
                        disabled={!replyMessage.trim() || isReplying}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                          !replyMessage.trim() || isReplying
                            ? 'bg-gray-600 bg-opacity-50 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 bg-opacity-80 text-white hover:bg-blue-700 hover:bg-opacity-80'
                        }`}
                      >
                        <Reply className="w-4 h-4" />
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p>Select a contact message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInquiries;