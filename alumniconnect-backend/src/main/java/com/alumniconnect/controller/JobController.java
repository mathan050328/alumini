package com.alumniconnect.controller;

import com.alumniconnect.dto.request.JobRequest;
import com.alumniconnect.dto.response.JobResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.entity.enums.EmploymentType;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.JobService;
import com.alumniconnect.util.AppConstants;
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
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job postings and search endpoints")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Post a new job opening")
    public ResponseEntity<JobResponse> postJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.postJob(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Search and filter active job opportunities with pagination")
    public ResponseEntity<PagedResponse<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) Boolean referralAvailable,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        PagedResponse<JobResponse> results = jobService.searchJobs(
                keyword, company, location, employmentType, referralAvailable,
                page, size, sortBy, sortDir, currentUserId);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed job view by job ID")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(jobService.getJobById(id, currentUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Update an existing job posting")
    public ResponseEntity<JobResponse> updateJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ALUMNI') or hasRole('ADMIN')")
    @Operation(summary = "Delete (deactivate) a job posting")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        jobService.deleteJob(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-posts")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Get all jobs posted by the currently authenticated alumni")
    public ResponseEntity<List<JobResponse>> getMyPostedJobs(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(jobService.getMyPostedJobs(currentUser.getId()));
    }
}
