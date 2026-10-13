import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { searchAlumni } from '../../api/alumniApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    company: '',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAlumni();
  }, [filters.page, filters.department, filters.company, filters.search]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = {
        keyword: filters.search?.trim() || undefined,
        department: filters.department || undefined,
        company: filters.company?.trim() || undefined,
        page: Math.max(0, filters.page - 1),
        size: filters.limit || 12
      };
      const res = await searchAlumni(params);
      const data = res.data || {};
      const list = data.content || (Array.isArray(data) ? data : (data.alumni || []));
      setAlumni(list);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load alumni directory');
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchAlumni();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: '',
      company: '',
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumni Directory</h1>
          <p className="mt-1 text-gray-500">Connect with graduates from your university.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFilter /> Filters
            </h2>
            
            <form onSubmit={handleSearchSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2"
                    placeholder="Search alumni..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  placeholder="e.g. Google, Microsoft"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors cursor-pointer">
                  Apply Filters
                </button>
                {(filters.search || filters.department || filters.company) && (
                  <button 
                    type="button" 
                    onClick={handleResetFilters}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-20"><LoadingSpinner /></div>
          ) : alumni.length === 0 ? (
            <EmptyState title="No alumni found" description="Try adjusting your search or filters to find what you're looking for." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {alumni.map((person) => {
                  const personId = person.id || person._id;
                  const personName = person.fullName || person.name || 'Alumni Member';
                  const personAvatar = person.profilePictureUrl || person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                  const isMentor = person.mentorshipAvailability === 'AVAILABLE' || person.isAvailableForMentorship;
                  const isVerified = person.verificationStatus === 'VERIFIED' || person.isVerified;
                  const skillList = Array.isArray(person.skills) ? person.skills : (person.skills ? Array.from(person.skills) : []);

                  return (
                    <Link key={personId} to={`/alumni/${personId}`} className="block group">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <img
                              src={personAvatar}
                              alt={personName}
                              className="w-16 h-16 rounded-full object-cover border border-gray-200"
                            />
                            {isMentor && (
                              <Badge variant="success" className="text-xs">Mentorship</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                            {personName}
                            {isVerified && <FiCheckCircle className="text-blue-500 w-4 h-4" />}
                          </h3>
                          
                          <div className="mt-2 space-y-2">
                            {person.jobTitle && (
                              <p className="text-sm text-gray-600 flex items-start gap-2">
                                <FiBriefcase className="mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{person.jobTitle} {person.currentCompany && `at ${person.currentCompany}`}</span>
                              </p>
                            )}
                            
                            {person.location && (
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <FiMapPin className="flex-shrink-0" />
                                {person.location}
                              </p>
                            )}
                          </div>

                          {skillList.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {skillList.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                              {skillList.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{skillList.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-medium">Class of {person.graduationYear || 'N/A'}</span>
                          <span className="text-sm text-indigo-600 font-medium group-hover:underline">View Profile</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination 
                    currentPage={filters.page}
                    totalPages={totalPages}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDirectory;
