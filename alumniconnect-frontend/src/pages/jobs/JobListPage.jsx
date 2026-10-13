import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiClock, FiBookmark, FiCalendar, FiDollarSign, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { searchJobs, saveJob, unsaveJob, getMyPostedJobs } from '../../api/jobApi';
import { EMPLOYMENT_TYPES, ROLES } from '../../utils/constants';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const JobListPage = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAlumni = isAuthenticated && (hasRole(ROLES.ALUMNI) || user?.role?.includes('ALUMNI'));
  const isAlumniPath = location.pathname.includes('/alumni/jobs');
  const [viewMode, setViewMode] = useState(isAlumniPath ? 'my' : 'all');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = 10;

  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    employmentType: '',
    company: ''
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (viewMode === 'my') {
        const response = await getMyPostedJobs();
        const list = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setJobs(list);
        setTotalPages(1);
        setTotalJobs(list.length);
      } else {
        const response = await searchJobs({
          page: currentPage - 1, // backend is 0-indexed
          size: limit,
          ...filters
        });
        const data = response.data || {};
        const list = Array.isArray(data) ? data : (data.content || data.jobs || []);
        setJobs(list);
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.totalElements || data.totalJobs || list.length);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters, viewMode]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      employmentType: '',
      company: ''
    });
    setCurrentPage(1);
  };

  const handleSaveJob = async (e, jobId, isSaved) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info('Please log in to save jobs');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      if (isSaved) {
        await unsaveJob(jobId);
        toast.success('Job removed from saved list');
      } else {
        await saveJob(jobId);
        toast.success('Job saved successfully');
      }
      
      // Update local state
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          return { ...job, isSaved: !isSaved };
        }
        return job;
      }));
    } catch (err) {
      console.error('Error toggling save job:', err);
      toast.error('Failed to update job status');
    }
  };

  const getEmploymentTypeLabel = (value) => {
    return EMPLOYMENT_TYPES[value] || value;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600 mt-2">Discover opportunities posted by alumni and partners.</p>
        </div>
        
        {isAuthenticated && hasRole(ROLES.ALUMNI) && (
          <Link
            to="/alumni/jobs/post"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Post a Job
          </Link>
        )}
      </div>

      {/* Alumni View Mode Tabs */}
      {isAlumni && (
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            type="button"
            onClick={() => { setViewMode('all'); setCurrentPage(1); }}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              viewMode === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Opportunities
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('my'); setCurrentPage(1); }}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              viewMode === 'my'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Job Postings
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Search by job title or keyword..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiFilter className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Filters
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>

        {/* Extended Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City, State, or Remote"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  placeholder="Company name"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                name="employmentType"
                id="employmentType"
                value={filters.employmentType}
                onChange={handleFilterChange}
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Types</option>
                {Object.entries(EMPLOYMENT_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && !error && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {jobs.length > 0 ? (currentPage - 1) * limit + 1 : 0} - {Math.min(currentPage * limit, totalJobs)} of {totalJobs} jobs
        </div>
      )}

      {/* Job Listings */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" color="indigo" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          title="No jobs found"
          description="Try adjusting your search or filters to find what you're looking for."
          icon={FiBriefcase}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link 
              key={job.id} 
              to={`/jobs/${job.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {job.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Badge 
                          text={getEmploymentTypeLabel(job.employmentType)} 
                          color="indigo" 
                          variant="subtle" 
                          size="sm" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {(!isAuthenticated || hasRole(ROLES.STUDENT)) && (
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      {job.hasApplied && (
                        <Badge text="Applied" color="success" size="sm" />
                      )}
                      <button
                        onClick={(e) => handleSaveJob(e, job.id, job.isSaved)}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                          job.isSaved ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={job.isSaved ? "Unsave Job" : "Save Job"}
                      >
                        <FiBookmark className={`h-5 w-5 ${job.isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  )}

                  {isAlumni && (viewMode === 'my' || job.alumniId === user?.id || job.postedBy?.userId === user?.id) && (
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <Link
                        to={`/alumni/jobs/${job.id}/applications`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                      >
                        View Applicants
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2 text-sm text-gray-600">
                    {job.salaryRange && (
                      <div className="flex items-center">
                        <FiDollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {job.salaryRange}
                      </div>
                    )}
                    {job.experienceRequired && (
                      <div className="flex items-center">
                        <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Exp: {job.experienceRequired}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 text-sm text-gray-600 md:items-end">
                    <div className="flex items-center">
                      <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Posted {formatTimeAgo(job.createdAt)}
                    </div>
                    {job.applicationDeadline && (
                      <div className={`flex items-center ${
                        new Date(job.applicationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        Deadline: {formatDate(job.applicationDeadline)}
                      </div>
                    )}
                  </div>
                </div>
                
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo(0, 0);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default JobListPage;
