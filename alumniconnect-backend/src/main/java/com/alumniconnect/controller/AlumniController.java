package com.alumniconnect.controller;

import com.alumniconnect.dto.request.AlumniExperienceRequest;
import com.alumniconnect.dto.request.AlumniProfileRequest;
import com.alumniconnect.dto.request.SkillRequest;
import com.alumniconnect.dto.request.StatusUpdateRequest;
import com.alumniconnect.dto.response.AlumniProfileResponse;
import com.alumniconnect.dto.response.AlumniSearchResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.AlumniService;
import com.alumniconnect.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/alumni")
@RequiredArgsConstructor
@Tag(name = "Alumni", description = "Alumni profile management, discovery, and search endpoints")
public class AlumniController {

    private final AlumniService alumniService;

    @GetMapping
    @Operation(summary = "Search and filter alumni directory with pagination")
    public ResponseEntity<PagedResponse<AlumniSearchResponse>> searchAlumni(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "graduationYear") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<AlumniSearchResponse> results = alumniService.searchAlumni(
                keyword, company, jobTitle, skill, location, graduationYear, department,
                minExperience, page, size, sortBy, sortDir);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "View public alumni profile by profile ID")
    public ResponseEntity<AlumniProfileResponse> getAlumniById(@PathVariable Long id) {
        return ResponseEntity.ok(alumniService.getProfileById(id));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Get currently authenticated alumni profile")
    public ResponseEntity<AlumniProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(alumniService.getProfileByUserId(currentUser.getId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Update alumni profile")
    public ResponseEntity<AlumniProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AlumniProfileRequest request) {
        return ResponseEntity.ok(alumniService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping("/profile/skills")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Add skills to alumni profile")
    public ResponseEntity<AlumniProfileResponse> addSkills(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(alumniService.addSkills(currentUser.getId(), request.getSkills()));
    }

    @DeleteMapping("/profile/skills/{skillId}")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Remove skill from alumni profile")
    public ResponseEntity<AlumniProfileResponse> removeSkill(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long skillId) {
        return ResponseEntity.ok(alumniService.removeSkill(currentUser.getId(), skillId));
    }

    @PostMapping("/profile/experience")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Add work experience entry to alumni profile")
    public ResponseEntity<AlumniProfileResponse> addExperience(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AlumniExperienceRequest request) {
        return ResponseEntity.ok(alumniService.addExperience(currentUser.getId(), request));
    }

    @DeleteMapping("/profile/experience/{expId}")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Remove work experience entry")
    public ResponseEntity<AlumniProfileResponse> removeExperience(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long expId) {
        return ResponseEntity.ok(alumniService.removeExperience(currentUser.getId(), expId));
    }

    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Upload alumni profile picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        String url = alumniService.uploadProfilePicture(currentUser.getId(), file);
        return ResponseEntity.ok(Collections.singletonMap("profilePictureUrl", url));
    }

    @PatchMapping("/profile/mentorship-status")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Toggle mentorship availability (AVAILABLE / UNAVAILABLE)")
    public ResponseEntity<AlumniProfileResponse> toggleMentorshipStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody StatusUpdateRequest request) {
        MentorshipAvailability availability = MentorshipAvailability.valueOf(request.getStatus().toUpperCase());
        return ResponseEntity.ok(alumniService.toggleMentorshipAvailability(currentUser.getId(), availability));
    }
}
