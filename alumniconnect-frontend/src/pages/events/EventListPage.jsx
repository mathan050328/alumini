import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, registerForEvent, cancelEventRegistration } from '../../api/eventApi';
import { useAuth } from '../../context/AuthContext';
import { EVENT_TYPES, ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import EventRegistrationModal from '../../components/events/EventRegistrationModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiPlus } from 'react-icons/fi';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEventForReg, setSelectedEventForReg] = useState(null);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const { user, hasRole } = useAuth();
  const limit = 10;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEvents({ type: eventType, page, limit });
      const data = res.data || {};
      let list = Array.isArray(data) ? data : (data.content || data.events || []);
      
      if (eventType) {
        list = list.filter(e => e.eventType === eventType);
      }

      if (Array.isArray(data)) {
        // Backend returns an unpaginated List, apply client-side pagination
        const total = list.length;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
        const start = (page - 1) * limit;
        setEvents(list.slice(start, start + limit));
      } else {
        setEvents(list);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [eventType, page, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegisterButtonClick = (event, isRegistered) => {
    if (isRegistered) {
      setSelectedEventForCancel(event);
    } else {
      setSelectedEventForReg(event);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedEventForReg) return;
    try {
      setIsSubmittingReg(true);
      const eventId = selectedEventForReg.id || selectedEventForReg._id;
      await registerForEvent(eventId);
      toast.success(`Registration confirmed for "${selectedEventForReg.title}"!`);
      setSelectedEventForReg(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedEventForCancel) return;
    try {
      setIsSubmittingReg(true);
      const eventId = selectedEventForCancel.id || selectedEventForCancel._id;
      await cancelEventRegistration(eventId);
      toast.success(`Successfully unregistered from "${selectedEventForCancel.title}"`);
      setSelectedEventForCancel(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel registration');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const canCreateEvent = hasRole(ROLES.ALUMNI) || hasRole(ROLES.ADMIN) || user?.role?.includes('ALUMNI');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Workshops</h1>
          <p className="text-gray-600 mt-1">Connect, learn, and network through alumni-led events.</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={eventType} 
            onChange={(e) => { setEventType(e.target.value); setPage(1); }}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm"
          >
            <option value="">All Types</option>
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {canCreateEvent && (
            <Link to="/events/create" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm">
              <FiPlus /> Create Event
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <EmptyState 
          title="No events found"
          message="No upcoming events match your selected criteria. Check back soon or create one!" 
          icon={FiCalendar} 
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => {
              const past = isPastEvent(event.eventDate);
              const isRegistered = Boolean(event.isRegistered);
              const registeredCount = Number(event.registeredCount || 0);
              const isFull = event.maxParticipants && registeredCount >= event.maxParticipants;
              
                const eventId = event.id || event._id;
                const isOrganizer = (event.organizerId || event.organizer?.id || event.organizer?._id) === user?.id;

                return (
                  <div key={eventId} className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow ${past ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate flex-1">
                          <Link to={`/events/${eventId}`} className="hover:text-indigo-600">
                            {event.title}
                          </Link>
                        </h2>
                        <Badge variant="primary">{EVENT_TYPES[event.eventType] || event.eventType}</Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" />
                          <span>{formatDateTime(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-gray-400" />
                          <span>{event.registeredCount ?? event.registeredParticipants?.length ?? 0} / {event.maxParticipants || 'Unlimited'} Registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-400" />
                          <span>Deadline: {formatDateTime(event.registrationDeadline)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-gray-900">
                          By {event.organizerName || event.organizer?.name || 'Unknown'}
                        </span>
                        
                        {!past && (
                          <button
                            onClick={() => handleRegisterButtonClick(event, isRegistered)}
                            disabled={(!isRegistered && isFull) || isOrganizer}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                              isRegistered 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                : isFull 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                            }`}
                          >
                            {isRegistered ? 'Unregister' : isFull ? 'Full' : 'Register'}
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </>
      )}

      {/* Event Registration Details Modal */}
      <EventRegistrationModal
        isOpen={Boolean(selectedEventForReg)}
        onClose={() => setSelectedEventForReg(null)}
        event={selectedEventForReg}
        user={user}
        onConfirm={handleConfirmRegistration}
        isSubmitting={isSubmittingReg}
      />

      {/* Cancel Registration Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedEventForCancel)}
        onClose={() => setSelectedEventForCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your registration for "${selectedEventForCancel?.title}"?`}
        confirmText="Yes, Cancel Registration"
        confirmVariant="danger"
        isLoading={isSubmittingReg}
      />
    </div>
  );
};

export default EventListPage;
