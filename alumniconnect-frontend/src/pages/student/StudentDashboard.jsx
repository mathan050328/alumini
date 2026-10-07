import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiBookmark, FiCalendar, FiArrowRight, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboard, getRecommendedAlumni } from '../../api/studentApi';
import { searchJobs } from '../../api/jobApi';
import { getEvents } from '../../api/eventApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recommendedAlumni, setRecommendedAlumni] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [statsRes, alumniRes, jobsRes, eventsRes] = await Promise.all([
          getStudentDashboard(),
          getRecommendedAlumni({ limit: 3 }),
          searchJobs({ limit: 3, sort: 'createdAt,desc' }),
          getEvents({ limit: 2, sort: 'date,asc', status: 'UPCOMING' })
        ]);

        setStats(statsRes.data || {
          activeMentorships: 0,
          jobApplications: 0,
          savedJobs: 0,
          upcomingEvents: 0
        });
        
        setRecommendedAlumni(alumniRes.data?.content || alumniRes.data || []);
        setRecentJobs(jobsRes.data?.content || jobsRes.data || []);
        setUpcomingEvents(eventsRes.data?.content || eventsRes.data || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'Student'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening in your alumni network today.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-indigo-100 p-4 rounded-lg text-indigo-600 mr-4">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Mentorships</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.activeMentorships || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600 mr-4">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Job Applications</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.jobApplications || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-green-100 p-4 rounded-lg text-green-600 mr-4">
            <FiBookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Saved Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.savedJobs || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-purple-100 p-4 rounded-lg text-purple-600 mr-4">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.upcomingEvents || 0}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-indigo-50 rounded-xl p-6 mb-10 border border-indigo-100">
        <h2 className="text-lg font-semibold text-indigo-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/alumni" className="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors px-6 py-2 rounded-lg font-medium shadow-sm border border-indigo-200">
            Find Alumni
          </Link>
          <Link to="/jobs" className="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors px-6 py-2 rounded-lg font-medium shadow-sm border border-indigo-200">
            Browse Jobs
          </Link>
          <Link to="/events" className="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors px-6 py-2 rounded-lg font-medium shadow-sm border border-indigo-200">
            View Events
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area - Left 2/3 */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Recommended Alumni */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiAward className="mr-2 text-indigo-600" /> Recommended Alumni
              </h2>
              <Link to="/alumni" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View all <FiArrowRight className="ml-1" />
              </Link>
            </div>
            
            {recommendedAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedAlumni.map((alumni) => (
                  <div key={alumni.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <img 
                      src={alumni.profilePicture || `https://ui-avatars.com/api/?name=${alumni.firstName}+${alumni.lastName}&background=random`}
                      alt={`${alumni.firstName} ${alumni.lastName}`}
                      className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-indigo-100"
                    />
                    <h3 className="font-semibold text-gray-900 truncate w-full">{alumni.firstName} {alumni.lastName}</h3>
                    <p className="text-sm text-gray-500 mb-2 truncate w-full">{alumni.jobTitle} at {alumni.company}</p>
                    
                    <div className="mt-2 mb-4 flex flex-wrap justify-center gap-1">
                      {alumni.skills?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {alumni.skills?.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{alumni.skills.length - 2}</span>
                      )}
                    </div>
                    
                    {alumni.matchScore && (
                      <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                        {alumni.matchScore}% Match
                      </div>
                    )}
                    
                    <Link to={`/alumni/${alumni.id}`} className="mt-auto w-full block text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 rounded-lg transition-colors text-sm">
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Update your skills and career interests to get personalized alumni recommendations.
              </div>
            )}
          </section>

          {/* Recent Jobs */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiBriefcase className="mr-2 text-indigo-600" /> Recent Job Postings
              </h2>
              <Link to="/jobs" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View all <FiArrowRight className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {recentJobs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600">{job.title}</Link>
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{job.company} • {job.location}</p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="primary">{job.employmentType}</Badge>
                          {job.isRemote && <Badge variant="secondary">Remote</Badge>}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.id}`} className="shrink-0 text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
                        Details <FiArrowRight className="ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No recent job postings available at the moment.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar - Right 1/3 */}
        <div className="lg:col-span-1">
          {/* Upcoming Events */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-indigo-600" /> Upcoming Events
              </h2>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 group">
                    <div className="bg-indigo-50 rounded-lg p-3 flex flex-col items-center justify-center text-indigo-700 min-w-[60px] h-[60px]">
                      <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.location || event.platform}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to="/events" className="block text-center w-full py-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                  View full calendar
                </Link>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                No upcoming events scheduled.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
