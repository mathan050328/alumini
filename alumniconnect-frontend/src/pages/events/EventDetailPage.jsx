import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, registerForEvent, cancelEventRegistration } from '../../api/eventApi';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EventRegistrationModal from '../../components/events/EventRegistrationModal';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiShare2, FiUser, FiMail } from 'react-icons/fi';

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await getEventById(id);
      setEvent(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load event details');
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegisterClick = () => {
    if (isRegistered) {
      setIsCancelDialogOpen(true);
    } else {
      setIsRegModalOpen(true);
    }
  };

  const handleConfirmRegistration = async () => {
    try {
      setIsSubmittingReg(true);
      await registerForEvent(id);
      toast.success('Registration confirmed! You are registered for this event.');
      setIsRegModalOpen(false);
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setIsSubmittingReg(true);
      await cancelEventRegistration(id);
      toast.success('Successfully unregistered from event');
      setIsCancelDialogOpen(false);
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel registration');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner />;
  if (error || !event) return <div className="text-center py-8 text-red-600">{error || 'Event not found'}</div>;

  const isPast = new Date(event.eventDate) < new Date();
  const isRegistered = event.isRegistered || event.registeredParticipants?.some(p => (p.id || p._id || p) === user?.id);
  const registeredCount = event.registeredCount ?? event.registeredParticipants?.length ?? 0;
  const isFull = event.maxParticipants && registeredCount >= event.maxParticipants;
  const isOrganizer = event.organizerId === user?.id || (event.organizer?.id || event.organizer?._id || event.organizer) === user?.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <Badge variant="primary">{event.eventType}</Badge>
            </div>
            <button 
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Share Event"
            >
              <FiShare2 className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 text-gray-600">
              <FiCalendar className="w-5 h-5 text-indigo-500" />
              <span>{formatDateTime(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FiMapPin className="w-5 h-5 text-indigo-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FiUsers className="w-5 h-5 text-indigo-500" />
              <span>{registeredCount} / {event.maxParticipants || 'Unlimited'} Participants</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <FiClock className="w-5 h-5 text-indigo-500" />
              <span>Register by: {formatDateTime(event.registrationDeadline)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-6">
              {/* Organizer Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.organizerName || event.organizer?.name || 'Unknown'}</p>
                    {(event.organizerEmail || event.organizer?.email) && (
                      <a href={`mailto:${event.organizerEmail || event.organizer?.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        <FiMail className="w-4 h-4" /> Contact
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isPast && !isOrganizer && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <button
                    onClick={handleRegisterClick}
                    disabled={!isRegistered && isFull}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                      isRegistered 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                        : isFull 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                  >
                    {isRegistered ? 'Cancel Registration' : isFull ? 'Event is Full' : 'Register for Event'}
                  </button>
                  {isRegistered && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        Registration Confirmed
                      </p>
                      <p className="text-gray-600">You are registered for this event. Reminders will be sent before start time.</p>
                    </div>
                  )}
                </div>
              )}
              {isOrganizer && (
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-indigo-700 font-medium">You are the organizer of this event.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participants List */}
        {(isOrganizer || isRegistered) && event.registeredParticipants?.length > 0 && (
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Participants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event.registeredParticipants.map((p, index) => (
                <div key={p.id || p._id || index} className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm border">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{p.name || 'Anonymous User'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Registration Details Modal */}
      <EventRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        event={event}
        user={user}
        onConfirm={handleConfirmRegistration}
        isSubmitting={isSubmittingReg}
      />

      {/* Cancel Registration Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your registration for "${event.title}"? Your spot will be released.`}
        confirmText="Yes, Cancel Registration"
        confirmVariant="danger"
        isLoading={isSubmittingReg}
      />
    </div>
  );
};

export default EventDetailPage;
