import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBriefcase, FiExternalLink, FiClock, FiFileText } from 'react-icons/fi';
import { getSentReferrals } from '../../api/referralApi';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { REFERRAL_STATUS } from '../../utils/constants';

const StudentReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const res = await getSentReferrals();
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setReferrals(list);
    } catch (error) {
      toast.error('Failed to load referral requests');
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case REFERRAL_STATUS.PENDING: return 'warning';
      case REFERRAL_STATUS.ACCEPTED: return 'success';
      case REFERRAL_STATUS.REJECTED: return 'danger';
      case REFERRAL_STATUS.COMPLETED: return 'purple';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Referral Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Track the status of job referral requests you've sent to alumni.</p>
      </div>

      {referrals.length === 0 ? (
        <EmptyState 
          icon={FiBriefcase} 
          title="No referrals requested" 
          message="You haven't requested any job referrals yet. Go to jobs or alumni profiles to request a referral." 
          action={{ label: "Browse Jobs", link: "/jobs" }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {referrals.map((referral) => {
            const id = referral.id || referral._id;
            const alumniName = referral.alumniName || referral.alumni?.name || 'Alumni';
            const companyName = referral.jobCompany || referral.company || referral.alumniCompany;
            const reqDate = referral.requestedAt || referral.createdAt;
            const resumeUrl = referral.studentResumeUrl || referral.resumeUrl;
            const avatarUrl = referral.alumniProfilePictureUrl || referral.alumni?.profilePicture;
            
            return (
              <div key={id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={getStatusVariant(referral.status)}>
                      {referral.status}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center">
                      <FiClock className="mr-1 w-3 h-3" />
                      {formatDate(reqDate)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{referral.jobTitle}</h3>
                    {companyName && (
                      <p className="text-indigo-600 font-medium text-sm flex items-center mt-1">
                        <FiBriefcase className="mr-1.5 w-4 h-4" />
                        {companyName}
                      </p>
                    )}
                  </div>
                  
                  <div className="py-3 border-t border-gray-100 mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Requested From</p>
                    <div className="flex items-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={alumniName} className="w-8 h-8 rounded-full mr-2 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-2 text-sm">
                          {alumniName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alumniName}</p>
                        <p className="text-xs text-gray-500">{referral.alumniCompany || referral.alumni?.currentPosition || 'Alumni'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {referral.message && (
                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700 italic border border-gray-100">
                      "{referral.message}"
                    </div>
                  )}

                  {resumeUrl && (
                    <div className="mt-4">
                      <a 
                        href={resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FiFileText className="mr-1 w-4 h-4" />
                        View Attached Resume
                      </a>
                    </div>
                  )}
                </div>
                
                {referral.jobUrl && (
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <a 
                      href={referral.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center justify-center"
                    >
                      View Original Job Post <FiExternalLink className="ml-1 w-4 h-4" />
                    </a>
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

export default StudentReferrals;
