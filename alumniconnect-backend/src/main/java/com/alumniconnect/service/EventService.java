package com.alumniconnect.service;

import com.alumniconnect.dto.request.EventRequest;
import com.alumniconnect.dto.response.EventResponse;
import com.alumniconnect.entity.Event;
import com.alumniconnect.entity.EventRegistration;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.EventRegistrationRepository;
import com.alumniconnect.repository.EventRepository;
import com.alumniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public EventResponse createEvent(Long organizerUserId, EventRequest request) {
        User organizer = userRepository.findById(organizerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", organizerUserId));

        if (organizer.getRole() != Role.ROLE_ALUMNI && organizer.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only Alumni or Admin can create events");
        }

        Event event = Event.builder()
                .organizer(organizer)
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(request.getEventType())
                .eventDate(request.getEventDate())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .registrationDeadline(request.getRegistrationDeadline())
                .isActive(true)
                .build();

        event = eventRepository.save(event);
        return mapToResponse(event, organizerUserId);
    }

    @Transactional
    public EventResponse updateEvent(Long userId, Long eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOrganizer = event.getOrganizer().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOrganizer && !isAdmin) {
            throw new BadRequestException("You are not authorized to update this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setRegistrationDeadline(request.getRegistrationDeadline());

        event = eventRepository.save(event);
        return mapToResponse(event, userId);
    }

    @Transactional
    public void deleteEvent(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOrganizer = event.getOrganizer().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOrganizer && !isAdmin) {
            throw new BadRequestException("You are not authorized to cancel this event");
        }

        event.setIsActive(false);
        eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getUpcomingEvents(Long currentUserId) {
        List<Event> events = eventRepository.findByEventDateAfterAndIsActiveTrueOrderByEventDateAsc(LocalDateTime.now());

        return events.stream()
                .map(e -> mapToResponse(e, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long eventId, Long currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        return mapToResponse(event, currentUserId);
    }

    @Transactional
    public void registerForEvent(Long userId, Long eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (!event.getIsActive()) {
            throw new BadRequestException("This event is no longer active");
        }

        // Deadline check
        if (event.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BadRequestException("Registration deadline for this event has passed");
        }

        // Capacity check
        if (event.getMaxParticipants() != null) {
            Long currentCount = eventRegistrationRepository.countByEventId(eventId);
            if (currentCount >= event.getMaxParticipants()) {
                throw new BadRequestException("This event has reached its maximum participant limit");
            }
        }

        // Prevent duplicate registration
        if (eventRegistrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new DuplicateResourceException("You are already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .user(user)
                .event(event)
                .build();

        eventRegistrationRepository.save(registration);

        notificationService.createNotification(
                userId,
                NotificationType.EVENT_REGISTRATION,
                "Event Registration Confirmed",
                "You are registered for: " + event.getTitle(),
                "/events/" + eventId
        );
    }

    @Transactional
    public void cancelRegistration(Long userId, Long eventId) {
        if (!eventRegistrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new BadRequestException("You are not registered for this event");
        }

        eventRegistrationRepository.deleteByUserIdAndEventId(userId, eventId);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getUserRegistrations(Long userId) {
        List<EventRegistration> registrations = eventRegistrationRepository.findByUserId(userId);

        return registrations.stream()
                .map(r -> mapToResponse(r.getEvent(), userId))
                .collect(Collectors.toList());
    }

    private EventResponse mapToResponse(Event event, Long currentUserId) {
        User organizer = event.getOrganizer();
        Long regCount = eventRegistrationRepository.countByEventId(event.getId());

        Boolean isRegistered = false;
        if (currentUserId != null) {
            isRegistered = eventRegistrationRepository.existsByUserIdAndEventId(currentUserId, event.getId());
        }

        return EventResponse.builder()
                .id(event.getId())
                .organizerId(organizer.getId())
                .organizerName(organizer.getFullName())
                .organizerEmail(organizer.getEmail())
                .organizerRole(organizer.getRole().name())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .registeredCount(regCount)
                .registrationDeadline(event.getRegistrationDeadline())
                .isActive(event.getIsActive())
                .createdAt(event.getCreatedAt())
                .isRegistered(isRegistered)
                .build();
    }
}
