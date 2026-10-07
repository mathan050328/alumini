import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiXCircle, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { getSentMentorships, cancelMentorship } from '../../api/mentorshipApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const StudentMentorships = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedMentorshipId, setSelectedMentorshipId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const res = await getSentMentorships();
      setMentorships(res.data?.content || res.data || []);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Failed to load mentorship requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (id) => {
    setSelectedMentorshipId(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedMentorshipId) return;
    try {
      setCancelling(true);
      await cancelMentorship(selectedMentorshipId);
      toast.success('Mentorship request cancelled successfully');
      // Refresh list
      fetchMentorships();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setSelectedMentorshipId(null);
    }
  };

  // Filter mentorships based on active tab
  const filteredMentorships = mentorships.filter(m => {
    if (activeTab === 'active') return ['PENDING', 'ACCEPTED'].includes(m.status);
    if (activeTab === 'completed') return m.status === 'COMPLETED';
    if (activeTab === 'cancelled') return ['REJECTED', 'CANCELLED'].includes(m.status);
    return true;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      case 'COMPLETED': return 'primary'; // Purple-ish
      case 'CANCELLED': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your mentorships..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentorships</h1>
        <p className="text-gray-600">Track and manage your mentorship requests with alumni.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('active')}
        >
          Active & Pending
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'completed' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'cancelled' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled & Declined
        </button>
      </div>

      {/* Mentorships List */}
      {filteredMentorships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentorships.map(mentorship => {
            const alumni = mentorship.alumni; // Assuming API returns alumni details
            const alumniName = alumni ? `${alumni.firstName} ${alumni.lastName}` : 'Unknown Alumni';
            
            return (
              <div key={mentorship.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4 shrink-0 overflow-hidden">
                        {alumni?.profilePicture ? (
                          <img src={alumni.profilePicture} alt={alumniName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{alumniName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alumni ? (
                            <Link to={`/alumni/${alumni.id}`} className="hover:text-indigo-600">{alumniName}</Link>
                          ) : alumniName}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{alumni?.jobTitle} at {alumni?.company}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(mentorship.status)}>
                      {mentorship.status}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 italic line-clamp-3">"{mentorship.message}"</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" /> Requested on: {formatDate(mentorship.createdAt || new Date())}
                    </div>
                    {mentorship.updatedAt && mentorship.updatedAt !== mentorship.createdAt && (
                      <div className="flex items-center">
                        <FiClock className="mr-2" /> Last updated: {formatDate(mentorship.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
                  {mentorship.status === 'ACCEPTED' && (
                    <Link to={`/messages?userId=${alumni?.id}`} className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      <FiMessageSquare className="mr-2" /> Message Mentor
                    </Link>
                  )}
                  {mentorship.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancelClick(mentorship.id)}
                      className="flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiXCircle className="mr-2" /> Cancel Request
                    </button>
                  )}
                  {['REJECTED', 'CANCELLED', 'COMPLETED'].includes(mentorship.status) && (
                    <span className="text-sm text-gray-500 flex items-center py-2">
                      <FiAlertCircle className="mr-1" /> No actions available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={<FiMessageSquare className="w-12 h-12 text-gray-300" />}
          title={`No ${activeTab} mentorships`}
          description={
            activeTab === 'active' ? "You don't have any active mentorship requests. Browse the alumni directory to find a mentor!" :
            activeTab === 'completed' ? "You haven't completed any mentorships yet." :
            "You have no cancelled or declined requests."
          }
          action={activeTab === 'active' ? { label: "Find Alumni", link: "/alumni" } : undefined}
        />
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        title="Cancel Mentorship Request"
        message="Are you sure you want to cancel this mentorship request? This action cannot be undone."
        confirmLabel="Yes, Cancel Request"
        cancelLabel="No, Keep It"
        onConfirm={confirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
        isLoading={cancelling}
        isDanger={true}
      />
    </div>
  );
};

export default StudentMentorships;
