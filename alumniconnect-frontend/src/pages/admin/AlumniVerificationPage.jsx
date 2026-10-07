import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiExternalLink, FiBriefcase, FiBook } from 'react-icons/fi';
import { getPendingAlumni, verifyAlumni, rejectAlumni } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';

const AlumniVerificationPage = () => {
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [actionType, setActionType] = useState(''); // 'verify' or 'reject'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAlumni();
  }, []);

  const fetchPendingAlumni = async () => {
    setLoading(true);
    try {
      const data = response.data || [];
      setPendingAlumni(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      toast.error('Failed to load pending verifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (alumni, action) => {
    setSelectedAlumni(alumni);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAlumni) return;
    
    setActionLoading(true);
    try {
      const alumniId = selectedAlumni._id || selectedAlumni.id;
      
      if (actionType === 'verify') {
        await verifyAlumni(alumniId);
        toast.success(`Alumni profile for ${selectedAlumni.user?.firstName || 'User'} verified successfully`);
      } else if (actionType === 'reject') {
        await rejectAlumni(alumniId);
        toast.success(`Alumni profile rejected`);
      }
      
      // Remove from list
      setPendingAlumni(pendingAlumni.filter(a => (a._id || a.id) !== alumniId));
      
    } catch (error) {
      toast.error(`Failed to ${actionType} alumni`);
      console.error(error);
    } finally {
      setActionLoading(false);
      setIsConfirmOpen(false);
      setSelectedAlumni(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Alumni Verification</h1>
      </div>
      
      <p className="text-gray-600">
        Review and verify alumni profiles to grant them access to the platform's alumni features.
      </p>

      {pendingAlumni.length === 0 ? (
        <EmptyState
          title="No pending verifications"
          message="There are currently no alumni profiles waiting to be verified."
          icon={FiCheck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingAlumni.map((alumni) => {
            const user = alumni.user || {};
            return (
              <div 
                key={alumni._id || alumni.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName || '') + ' ' + (user.lastName || ''))}`} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start space-x-2 text-sm">
                      <FiBook className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Education:</span>
                        <p className="text-gray-600">{alumni.department || 'N/A'}, Class of {alumni.graduationYear || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 text-sm">
                      <FiBriefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Current Role:</span>
                        <p className="text-gray-600">{alumni.jobTitle || 'N/A'} at {alumni.company || 'N/A'}</p>
                      </div>
                    </div>

                    {alumni.linkedInProfile && (
                      <div className="pt-2">
                        <a 
                          href={alumni.linkedInProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          View LinkedIn Profile <FiExternalLink className="ml-1 w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => openConfirmDialog(alumni, 'reject')}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiX className="mr-1 -ml-0.5 h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => openConfirmDialog(alumni, 'verify')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiCheck className="mr-1 -ml-0.5 h-4 w-4" />
                    Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={`${actionType === 'verify' ? 'Verify' : 'Reject'} Alumni Profile`}
        message={`Are you sure you want to ${actionType} the alumni profile for ${selectedAlumni?.user?.firstName}?`}
        confirmText={actionType === 'verify' ? 'Verify' : 'Reject'}
        confirmVariant={actionType === 'verify' ? 'success' : 'danger'}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AlumniVerificationPage;
