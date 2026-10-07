package com.alumniconnect.controller;

import com.alumniconnect.dto.response.JobResponse;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Student job bookmarking endpoints")
public class SavedJobController {

    private final JobService jobService;

    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save (bookmark) a job")
    public ResponseEntity<Void> saveJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long jobId) {
        jobService.saveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove a job from saved bookmarks")
    public ResponseEntity<Void> unsaveJob(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long jobId) {
        jobService.unsaveJob(currentUser.getId(), jobId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student's saved bookmark jobs")
    public ResponseEntity<List<JobResponse>> getSavedJobs(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(jobService.getSavedJobs(currentUser.getId()));
    }
}
