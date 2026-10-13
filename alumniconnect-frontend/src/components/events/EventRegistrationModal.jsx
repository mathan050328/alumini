import React, { useState } from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiUser, FiMail, FiX, FiCheckCircle } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatters';
import { EVENT_TYPES } from '../../utils/constants';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';

const EventRegistrationModal = ({
  isOpen,
  onClose,
  event,
  user,
  onConfirm,
  isSubmitting = false
}) => {
  const [attendeeNote, setAttendeeNote] = useState('');

  if (!isOpen || !event) return null;

  const eventTypeLabel = EVENT_TYPES[event.eventType] || event.eventType || 'Event';
  const registeredCount = Number(event.registeredCount || 0);
  const maxSpots = event.maxParticipants ? Number(event.maxParticipants) : null;
  const spotsLeft = maxSpots ? Math.max(0, maxSpots - registeredCount) : null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      note: attendeeNote.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Event Registration</h3>
            <p className="text-indigo-100 text-xs mt-0.5">Please review your registration details</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Event Summary Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-gray-900 text-base leading-snug">{event.title}</h4>
              <Badge variant="primary">{eventTypeLabel}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700 pt-1">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-indigo-600 shrink-0 w-4 h-4" />
                <span className="font-medium">{formatDateTime(event.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-indigo-600 shrink-0 w-4 h-4" />
                <span className="truncate">{event.location || 'Virtual Platform'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-indigo-600 shrink-0 w-4 h-4" />
                <span>By {event.organizerName || event.organizer?.name || 'Event Host'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers className="text-indigo-600 shrink-0 w-4 h-4" />
                <span>
                  {maxSpots ? `${spotsLeft} spots left (${registeredCount}/${maxSpots})` : `${registeredCount} registered`}
                </span>
              </div>
            </div>

            {event.registrationDeadline && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200">
                <FiClock className="w-3.5 h-3.5 shrink-0" />
                <span>Registration deadline: {formatDateTime(event.registrationDeadline)}</span>
              </div>
            )}
          </div>

          {/* Attendee Info Section */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Attendee Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Attendee Name</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-gray-800 font-medium">
                  <FiUser className="text-gray-400 w-4 h-4" />
                  <span className="truncate">{user?.fullName || 'Participant'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirmation Email</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-gray-800">
                  <FiMail className="text-gray-400 w-4 h-4" />
                  <span className="truncate">{user?.email || 'user@example.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Note / Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questions or Topics for the Speaker / Organizer <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={attendeeNote}
              onChange={(e) => setAttendeeNote(e.target.value)}
              placeholder="e.g. Interested in learning about interview preparation, machine learning roadmap..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 shadow-sm"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">This helps the organizer tailor the session to attendee interests.</p>
          </div>

          {/* Registration Notice */}
          <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <FiCheckCircle className="text-green-600 w-4 h-4 mt-0.5 shrink-0" />
            <span>
              By clicking <strong>Confirm & Register</strong>, you will be registered. You can cancel your registration at any time prior to the event.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Confirm & Register</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationModal;
