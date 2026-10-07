package com.alumniconnect.controller;

import com.alumniconnect.dto.request.MentorshipRequestDto;
import com.alumniconnect.dto.response.MentorshipResponse;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.MentorshipService;
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
@RequestMapping("/api/mentorships")
@RequiredArgsConstructor
@Tag(name = "Mentorship", description = "Student-alumni mentorship workflow endpoints")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit a mentorship request to an alumni")
    public ResponseEntity<MentorshipResponse> requestMentorship(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody MentorshipRequestDto request) {
        MentorshipResponse response = mentorshipService.requestMentorship(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/sent")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student's sent mentorship requests")
    public ResponseEntity<List<MentorshipResponse>> getSentRequests(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(mentorshipService.getStudentMentorships(currentUser.getId()));
    }

    @GetMapping("/received")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Get alumni's received mentorship requests")
    public ResponseEntity<List<MentorshipResponse>> getReceivedRequests(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(mentorshipService.getAlumniMentorships(currentUser.getId()));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Accept a mentorship request")
    public ResponseEntity<MentorshipResponse> acceptMentorship(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.acceptMentorship(currentUser.getId(), id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Reject a mentorship request")
    public ResponseEntity<MentorshipResponse> rejectMentorship(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.rejectMentorship(currentUser.getId(), id));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Mark an active mentorship as completed")
    public ResponseEntity<MentorshipResponse> completeMentorship(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.completeMentorship(currentUser.getId(), id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a mentorship request")
    public ResponseEntity<MentorshipResponse> cancelMentorship(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.cancelMentorship(currentUser.getId(), id));
    }
}
