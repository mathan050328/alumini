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
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiPlus } from 'react-icons/fi';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventType, setEventType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, hasRole } = useAuth();
  const limit = 10;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEvents({ type: eventType, page, limit });
      setEvents(data.events || data);
      setTotalPages(data.totalPages || 1);
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

  const handleRegister = async (eventId, isRegistered) => {
    try {
      if (isRegistered) {
        await cancelEventRegistration(eventId);
        toast.success('Successfully unregistered from event');
      } else {
        await registerForEvent(eventId);
        toast.success('Successfully registered for event');
      }
      fetchEvents();
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const canCreateEvent = hasRole(ROLES.ALUMNI) || hasRole(ROLES.ADMIN);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <div className="flex gap-4 items-center">
          <select 
            value={eventType} 
            onChange={(e) => { setEventType(e.target.value); setPage(1); }}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
          >
            <option value="">All Types</option>
            {Object.values(EVENT_TYPES).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {canCreateEvent && (
            <Link to="/events/create" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              <FiPlus /> Create Event
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <EmptyState message="No events found matching your criteria" icon={FiCalendar} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => {
              const past = isPastEvent(event.eventDate);
              const isRegistered = event.registeredParticipants?.includes(user?.id) || event.isRegistered;
              const isFull = event.registeredParticipants?.length >= event.maxParticipants;
              
              return (
                <div key={event._id || event.id} className={`bg-white rounded-lg shadow overflow-hidden border ${past ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                        <Link to={`/events/${event._id || event.id}`} className="hover:text-indigo-600">
                          {event.title}
                        </Link>
                      </h2>
                      <Badge variant="primary">{event.eventType}</Badge>
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
                        <span>{event.registeredParticipants?.length || 0} / {event.maxParticipants} Registered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-gray-400" />
                        <span>Deadline: {formatDateTime(event.registrationDeadline)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-gray-900">
                        By {event.organizer?.name || 'Unknown'}
                      </span>
                      
                      {!past && (
                        <button
                          onClick={() => handleRegister(event._id || event.id, isRegistered)}
                          disabled={(!isRegistered && isFull) || (event.organizer?._id === user?.id)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            isRegistered 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : isFull 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
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
    </div>
  );
};

export default EventListPage;
