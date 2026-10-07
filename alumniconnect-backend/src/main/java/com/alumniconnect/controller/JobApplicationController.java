package com.alumniconnect.controller;

import com.alumniconnect.dto.request.JobApplicationRequest;
import com.alumniconnect.dto.request.StatusUpdateRequest;
import com.alumniconnect.dto.response.JobApplicationResponse;
import com.alumniconnect.entity.enums.ApplicationStatus;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.JobService;
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
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Job Applications", description = "Job application workflows")
public class JobApplicationController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Apply for a job")
    public ResponseEntity<JobApplicationResponse> apply(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody JobApplicationRequest request) {
        JobApplicationResponse response = jobService.applyForJob(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's submitted job applications")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(jobService.getStudentApplications(currentUser.getId()));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Get all applications received for a specific job")
    public ResponseEntity<List<JobApplicationResponse>> getJobApplications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getApplicationsForJob(currentUser.getId(), jobId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Update application status (REVIEWED, SHORTLISTED, REJECTED)")
    public ResponseEntity<JobApplicationResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        ApplicationStatus status = ApplicationStatus.valueOf(request.getStatus().toUpperCase());
        return ResponseEntity.ok(jobService.updateApplicationStatus(currentUser.getId(), id, status));
    }
}
