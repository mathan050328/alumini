import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiBookmark, FiTrash2, FiClock, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getSavedJobs, unsaveJob } from '../../api/jobApi';
import { EMPLOYMENT_TYPES } from '../../utils/constants';
import { formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobs();
      const data = response.data || {};
      const list = Array.isArray(data) ? data : (data.content || data.jobs || []);
      setSavedJobs(list);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs. Please try again later.');
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
      toast.success('Job removed from saved list');
    } catch (err) {
      toast.error('Failed to remove job');
    }
  };

  const getEmploymentTypeLabel = (value) => {
    return EMPLOYMENT_TYPES[value] || value;
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiBookmark className="mr-3 text-indigo-600" />
          Saved Jobs
        </h1>
        <p className="text-gray-600 mt-1">Jobs you have bookmarked for later</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState 
          title="No saved jobs"
          description="You haven't saved any jobs yet. Browse the job board and click the bookmark icon to save jobs here."
          icon={FiBookmark}
          action={{
            label: "Browse Jobs",
            link: "/jobs"
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-4">
                    {job.title}
                  </h3>
                  <button
                    onClick={(e) => handleRemove(e, job.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove from saved"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiBriefcase className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiMapPin className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  
                  {job.salaryRange && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiDollarSign className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{job.salaryRange}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <Badge 
                    text={getEmploymentTypeLabel(job.employmentType)} 
                    color="indigo" 
                    variant="subtle" 
                    size="sm" 
                  />
                </div>
              </div>
              
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 mt-auto rounded-b-lg">
                <span className="flex items-center">
                  <FiClock className="mr-1 h-3 w-3" />
                  Posted {formatTimeAgo(job.createdAt)}
                </span>
                
                {job.hasApplied && (
                  <span className="text-green-600 font-medium">Applied</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
