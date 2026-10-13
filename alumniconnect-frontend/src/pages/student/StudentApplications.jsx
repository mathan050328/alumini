import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiCalendar, FiFileText, FiClock, FiCheckCircle, FiXCircle, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getMyApplications } from '../../api/jobApi';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await getMyApplications();
        const data = response.data || {};
        const list = Array.isArray(data) ? data : (data.content || data.applications || []);
        setApplications(list);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications. Please try again later.');
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPLIED':
        return { color: 'info', icon: FiClock, label: 'Applied' };
      case 'REVIEWED':
        return { color: 'warning', icon: FiFileText, label: 'Under Review' };
      case 'SHORTLISTED':
        return { color: 'success', icon: FiCheckCircle, label: 'Shortlisted' };
      case 'REJECTED':
        return { color: 'danger', icon: FiXCircle, label: 'Not Selected' };
      default:
        return { color: 'gray', icon: FiClock, label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" color="indigo" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Job Applications</h1>
        <p className="text-gray-600 mt-1">Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState 
          title="No applications yet"
          description="You haven't applied to any jobs on the platform yet. Browse the job board to find opportunities."
          icon={FiBriefcase}
          action={{
            label: "Browse Jobs",
            link: "/jobs"
          }}
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              const jobId = app.jobId || app.job?.id || app.job?._id;
              const jobTitle = app.jobTitle || app.job?.title || 'Job Opportunity';
              const jobCompany = app.jobCompany || app.job?.company || 'Company';
              const appliedDate = app.appliedAt || app.createdAt;

              return (
                <li key={app.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <Link 
                          to={jobId ? `/jobs/${jobId}` : '#'}
                          className="text-lg font-medium text-indigo-600 truncate hover:text-indigo-800"
                        >
                          {jobTitle}
                        </Link>
                        <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
                          <Badge variant={statusConfig.color} text={statusConfig.label} />
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button
                          onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
                        >
                          {selectedApp === app.id ? 'Hide Details' : 'View Cover Letter'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-6 text-sm text-gray-500">
                        <p className="flex items-center">
                          <FiBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {jobCompany}
                        </p>
                        <p className="mt-2 sm:mt-0 flex items-center">
                          <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          Applied on {formatDate(appliedDate)}
                        </p>
                      </div>
                      
                      <div className="mt-2 sm:mt-0 text-sm">
                        {jobId && (
                          <Link 
                            to={`/jobs/${jobId}`}
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                          >
                            View Job Post
                            <FiExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Cover Letter View */}
                    {selectedApp === app.id && app.coverLetter && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <FiFileText className="mr-2 text-gray-500" />
                          Cover Letter / Message
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap pl-6 border-l-2 border-indigo-200">
                          {app.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
