import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, FiUser, FiMail, FiBook, FiCalendar, FiFileText, 
  FiCheckCircle, FiXCircle, FiClock, FiExternalLink, FiBriefcase 
} from 'react-icons/fi';
import { getJobById, getJobApplications, updateApplicationStatus } from '../../api/jobApi';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const JobApplicationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobRes, appsRes] = await Promise.all([
        getJobById(id),
        getJobApplications(id)
      ]);
      setJob(jobRes.data);
      const appList = Array.isArray(appsRes.data) 
        ? appsRes.data 
        : (appsRes.data?.content || appsRes.data?.applications || []);
      setApplications(appList);
    } catch (err) {
      console.error('Error fetching job applications:', err);
      toast.error('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application marked as ${newStatus.toLowerCase()}`);
      setApplications(prev => prev.map(app => 
        (app.id === applicationId || app._id === applicationId)
          ? { ...app, status: newStatus }
          : app
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return <Badge variant="info">New Applied</Badge>;
      case 'REVIEWED':
        return <Badge variant="warning">Under Review</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(`/jobs/${id}`)}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
      >
        <FiArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Job Details
      </button>

      {/* Job Summary Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Applicant Tracking
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {job?.title || 'Job Opportunity'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {job?.company} • {job?.location} • {job?.employmentType?.replace('_', ' ')}
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-center self-start md:self-auto">
          <p className="text-xs text-indigo-600 font-semibold uppercase">Total Applicants</p>
          <p className="text-2xl font-bold text-indigo-900">{applications.length}</p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          icon={FiBriefcase}
          title="No applications received yet"
          message="Students who apply for this job posting will appear here. Check back soon!"
          action={{
            label: "View Job Posting",
            link: `/jobs/${id}`
          }}
        />
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const appId = app.id || app._id;
            const student = app.student || {};
            const studentName = app.studentName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.fullName || 'Candidate';
            const studentEmail = app.studentEmail || student.email || 'No email provided';
            const studentAvatar = app.studentProfilePictureUrl || student.profilePictureUrl || student.profilePicture;
            const resumeUrl = app.resumeUrl || student.resumeUrl;
            const isProcessing = updatingId === appId;

            return (
              <div
                key={appId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  {/* Candidate Profile Info */}
                  <div className="flex items-start gap-4">
                    {studentAvatar ? (
                      <img
                        src={studentAvatar}
                        alt={studentName}
                        className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl shrink-0">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{studentName}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <FiMail className="w-3.5 h-3.5" />
                        <a href={`mailto:${studentEmail}`} className="hover:underline">{studentEmail}</a>
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                        <FiBook className="w-3.5 h-3.5 text-gray-400" />
                        {app.studentDepartment || student.department || 'Student'} • Class of {app.studentGraduationYear || student.graduationYear || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Status & Applied Date */}
                  <div className="flex flex-col md:items-end gap-1.5">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Applied on {formatDate(app.appliedAt || app.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Cover Letter */}
                {app.coverLetter && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cover Note / Message:</p>
                    <p className="text-gray-700 italic whitespace-pre-line leading-relaxed">
                      "{app.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Candidate Attachments & Action Controls */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    {resumeUrl ? (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
                      >
                        <FiFileText className="w-4 h-4" />
                        View Attached Resume
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No resume file attached</span>
                    )}
                  </div>

                  {/* Status change buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Change status:</span>

                    <button
                      type="button"
                      disabled={isProcessing || app.status === 'SHORTLISTED'}
                      onClick={() => handleStatusUpdate(appId, 'SHORTLISTED')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                          : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      Shortlist
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing || app.status === 'REVIEWED'}
                      onClick={() => handleStatusUpdate(appId, 'REVIEWED')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        app.status === 'REVIEWED'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200 cursor-default'
                          : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <FiClock className="w-3.5 h-3.5" />
                      Reviewing
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing || app.status === 'REJECTED'}
                      onClick={() => handleStatusUpdate(appId, 'REJECTED')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700 border border-red-200 cursor-default'
                          : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <FiXCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;
