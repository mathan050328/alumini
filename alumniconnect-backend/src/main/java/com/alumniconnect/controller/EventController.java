package com.alumniconnect.controller;

import com.alumniconnect.dto.request.EventRequest;
import com.alumniconnect.dto.response.EventResponse;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Alumni workshops, meetups, webinars, and event registrations")
public class EventController {

    private final EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Create an event")
    public ResponseEntity<EventResponse> createEvent(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody EventRequest request) {
        EventResponse response = eventService.createEvent(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all upcoming active events")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(eventService.getUpcomingEvents(currentUserId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed event view by event ID")
    public ResponseEntity<EventResponse> getEventById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(eventService.getEventById(id, currentUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Update event details")
    public ResponseEntity<EventResponse> updateEvent(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Cancel / deactivate an event")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        eventService.deleteEvent(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    @Operation(summary = "Register for an event")
    public ResponseEntity<Void> registerForEvent(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        eventService.registerForEvent(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/register")
    @Operation(summary = "Cancel event registration")
    public ResponseEntity<Void> cancelRegistration(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        eventService.cancelRegistration(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-registrations")
    @Operation(summary = "Get events registered by current user")
    public ResponseEntity<List<EventResponse>> getMyRegistrations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(eventService.getUserRegistrations(currentUser.getId()));
    }
}
