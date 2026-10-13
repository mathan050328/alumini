import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';
import { getReceivedMentorships, acceptMentorship, rejectMentorship, completeMentorship } from '../../api/mentorshipApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { MENTORSHIP_STATUS } from '../../utils/constants';
import { toast } from 'react-toastify';

const AlumniMentorships = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active', 'completed'
  const [actionLoading, setActionLoading] = useState(null); // store id of item being processed

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    setLoading(true);
    try {
      const response = await getReceivedMentorships();
      const data = response.data || [];
      setMentorships(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      toast.error('Failed to load mentorship requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'accept') {
        await acceptMentorship(id);
        toast.success('Mentorship request accepted');
        updateLocalStatus(id, MENTORSHIP_STATUS.ACCEPTED);
      } else if (action === 'reject') {
        await rejectMentorship(id);
        toast.success('Mentorship request rejected');
        updateLocalStatus(id, MENTORSHIP_STATUS.REJECTED);
      } else if (action === 'complete') {
        await completeMentorship(id);
        toast.success('Mentorship marked as completed');
        updateLocalStatus(id, MENTORSHIP_STATUS.COMPLETED);
      }
    } catch (error) {
      toast.error(`Failed to ${action} mentorship`);
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const updateLocalStatus = (id, newStatus) => {
    setMentorships(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  // Filter based on active tab
  const filteredMentorships = mentorships.filter(m => {
    if (activeTab === 'pending') return m.status === MENTORSHIP_STATUS.PENDING;
    if (activeTab === 'active') return m.status === MENTORSHIP_STATUS.ACCEPTED;
    if (activeTab === 'completed') return m.status === MENTORSHIP_STATUS.COMPLETED || m.status === MENTORSHIP_STATUS.REJECTED;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case MENTORSHIP_STATUS.PENDING: return <Badge variant="warning">Pending</Badge>;
      case MENTORSHIP_STATUS.ACCEPTED: return <Badge variant="success">Active</Badge>;
      case MENTORSHIP_STATUS.COMPLETED: return <Badge variant="primary">Completed</Badge>;
      case MENTORSHIP_STATUS.REJECTED: return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['pending', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab === 'pending' ? 'Pending Requests' : tab}
              {tab === 'pending' && mentorships.filter(m => m.status === MENTORSHIP_STATUS.PENDING).length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                  {mentorships.filter(m => m.status === MENTORSHIP_STATUS.PENDING).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredMentorships.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} mentorships`}
          message={`You don't have any ${activeTab} mentorship requests at the moment.`}
          icon={FiMessageSquare}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMentorships.map((request) => {
            const student = request.student?.user || request.student || {};
            const reqId = request._id || request.id;
            const isProcessing = actionLoading === reqId;

            const displayName = request.studentName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
            const displayAvatar = request.studentProfilePictureUrl || student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            const reqDate = request.requestedAt || request.createdAt;

            return (
              <div key={reqId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={displayAvatar} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-md font-bold text-gray-900">
                          {displayName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {request.studentDepartment || request.student?.department || 'Student'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 italic border border-gray-100">
                    "{request.message}"
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <FiClock className="mr-1" />
                    Requested on {formatDate(reqDate)}
                  </div>
                </div>

                {request.status === MENTORSHIP_STATUS.PENDING && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                      onClick={() => handleAction(reqId, 'reject')}
                      disabled={isProcessing}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiXCircle className="mr-1 -ml-0.5 h-4 w-4" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(reqId, 'accept')}
                      disabled={isProcessing}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <FiCheckCircle className="mr-1 -ml-0.5 h-4 w-4" />
                      Accept Request
                    </button>
                  </div>
                )}

                {request.status === MENTORSHIP_STATUS.ACCEPTED && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    {(request.studentUserId || request.studentId || student.id) && (
                      <Link
                        to={`/messages?userId=${request.studentUserId || request.studentId || student.id}`}
                        className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                      >
                        <FiMessageSquare className="mr-1.5 h-4 w-4" />
                        Message Student
                      </Link>
                    )}
                    <button
                      onClick={() => handleAction(reqId, 'complete')}
                      disabled={isProcessing}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiCheckCircle className="mr-1.5 h-4 w-4" />
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlumniMentorships;
