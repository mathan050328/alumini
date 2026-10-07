import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBriefcase, FiUser, FiClock, FiCheck, FiX, FiAward, FiFileText, FiExternalLink } from 'react-icons/fi';
import { getReceivedReferrals, acceptReferral, rejectReferral, completeReferral } from '../../api/referralApi';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { REFERRAL_STATUS } from '../../utils/constants';

const AlumniReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: null, referralId: null });

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const res = await getReceivedReferrals();
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setReferrals(list);
    } catch (error) {
      toast.error('Failed to load received referrals');
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleActionClick = (type, referralId) => {
    setDialogConfig({ isOpen: true, type, referralId });
  };

  const handleConfirmAction = async () => {
    const { type, referralId } = dialogConfig;
    if (!referralId || !type) return;

    try {
      if (type === 'accept') {
        await acceptReferral(referralId);
        toast.success('Referral request accepted');
      } else if (type === 'reject') {
        await rejectReferral(referralId);
        toast.info('Referral request rejected');
      } else if (type === 'complete') {
        await completeReferral(referralId);
        toast.success('Referral marked as completed');
      }
      
      // Update local state to reflect change
      setReferrals(prev => prev.map(ref => {
        if ((ref.id || ref._id) === referralId) {
          let newStatus = ref.status;
          if (type === 'accept') newStatus = REFERRAL_STATUS.ACCEPTED;
          if (type === 'reject') newStatus = REFERRAL_STATUS.REJECTED;
          if (type === 'complete') newStatus = REFERRAL_STATUS.COMPLETED;
          return { ...ref, status: newStatus };
        }
        return ref;
      }));
    } catch (error) {
      toast.error(`Failed to ${type} referral`);
    } finally {
      setDialogConfig({ isOpen: false, type: null, referralId: null });
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case REFERRAL_STATUS.PENDING: return 'warning';
      case REFERRAL_STATUS.ACCEPTED: return 'success';
      case REFERRAL_STATUS.REJECTED: return 'danger';
      case REFERRAL_STATUS.COMPLETED: return 'purple';
      default: return 'secondary';
    }
  };

  const getDialogDetails = () => {
    switch (dialogConfig.type) {
      case 'accept':
        return { title: 'Accept Referral Request', message: 'Are you sure you want to accept this referral request? You will be expected to refer this student to your company.' };
      case 'reject':
        return { title: 'Reject Referral Request', message: 'Are you sure you want to decline this request? The student will be notified.' };
      case 'complete':
        return { title: 'Complete Referral', message: 'Mark this referral as completed? This confirms you have successfully submitted the referral for the student.' };
      default:
        return { title: 'Confirm Action', message: 'Are you sure?' };
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Referral Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Review and manage job referral requests from students.</p>
      </div>

      {referrals.length === 0 ? (
        <EmptyState 
          icon={FiAward} 
          title="No requests yet" 
          message="You don't have any pending referral requests at the moment." 
        />
      ) : (
        <div className="space-y-6">
          {referrals.map((referral) => {
            const id = referral.id || referral._id;
            const isPending = referral.status === REFERRAL_STATUS.PENDING;
            const isAccepted = referral.status === REFERRAL_STATUS.ACCEPTED;

            return (
              <div key={id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                    <div className="flex items-center">
                      {referral.student?.profilePicture ? (
                        <img src={referral.student.profilePicture} alt={referral.student.name} className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4 text-lg">
                          {referral.student?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{referral.student?.name}</h3>
                        <p className="text-sm text-gray-500">{referral.student?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      <Badge variant={getStatusVariant(referral.status)}>
                        {referral.status}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1 w-3 h-3" />
                        Requested on {formatDate(referral.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Position Target</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <FiBriefcase className="mr-1.5 w-4 h-4 text-indigo-500" />
                          {referral.jobTitle}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">at {referral.company}</p>
                        
                        {referral.jobUrl && (
                          <a 
                            href={referral.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            <FiExternalLink className="mr-1 w-3 h-3" /> View Job Posting
                          </a>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Student Assets</p>
                        {referral.resumeUrl ? (
                          <a 
                            href={referral.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1 px-3 bg-indigo-50 rounded-md border border-indigo-100"
                          >
                            <FiFileText className="mr-2 w-4 h-4" />
                            Review Resume
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No resume attached</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {referral.message && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Message from student:</p>
                      <div className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-3 py-1">
                        "{referral.message}"
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions sidebar */}
                {(isPending || isAccepted) && (
                  <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-6 flex flex-col justify-center space-y-3 min-w-[200px]">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleActionClick('accept', id)}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiCheck className="mr-2 -ml-1 h-4 w-4" />
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleActionClick('reject', id)}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiX className="mr-2 -ml-1 h-4 w-4 text-red-500" />
                          Decline
                        </button>
                      </>
                    )}
                    
                    {isAccepted && (
                      <button
                        onClick={() => handleActionClick('complete', id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FiAward className="mr-2 -ml-1 h-4 w-4" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        title={getDialogDetails().title}
        message={getDialogDetails().message}
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogConfig({ isOpen: false, type: null, referralId: null })}
        confirmText={dialogConfig.type === 'reject' ? 'Reject' : 'Confirm'}
        confirmVariant={dialogConfig.type === 'reject' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default AlumniReferrals;
