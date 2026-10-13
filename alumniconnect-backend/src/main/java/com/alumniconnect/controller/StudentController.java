package com.alumniconnect.controller;

import com.alumniconnect.dto.request.SkillRequest;
import com.alumniconnect.dto.request.StudentProfileRequest;
import com.alumniconnect.dto.request.StudentProjectRequest;
import com.alumniconnect.dto.response.RecommendedAlumniResponse;
import com.alumniconnect.dto.response.StudentProfileResponse;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.RecommendationService;
import com.alumniconnect.service.StudentService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student profile, portfolio, and dashboard endpoints")
public class StudentController {

    private final StudentService studentService;
    private final RecommendationService recommendationService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's profile")
    public ResponseEntity<StudentProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(studentService.getProfileByUserId(currentUser.getId()));
    }

    @GetMapping("/profile/{id}")
    @Operation(summary = "Get student profile by ID")
    public ResponseEntity<StudentProfileResponse> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getProfileById(id));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update current student's profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(studentService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping("/profile/skills")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add skills to student profile")
    public ResponseEntity<StudentProfileResponse> addSkills(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(studentService.addSkills(currentUser.getId(), request.getSkills()));
    }

    @DeleteMapping("/profile/skills/{skillId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove skill from student profile")
    public ResponseEntity<StudentProfileResponse> removeSkill(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String skillId) {
        return ResponseEntity.ok(studentService.removeSkill(currentUser.getId(), skillId));
    }

    @PostMapping("/profile/projects")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add portfolio project to student profile")
    public ResponseEntity<StudentProfileResponse> addProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody StudentProjectRequest request) {
        return ResponseEntity.ok(studentService.addProject(currentUser.getId(), request));
    }

    @DeleteMapping("/profile/projects/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete portfolio project")
    public ResponseEntity<StudentProfileResponse> removeProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long projectId) {
        return ResponseEntity.ok(studentService.removeProject(currentUser.getId(), projectId));
    }

    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload profile picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        String url = studentService.uploadProfilePicture(currentUser.getId(), file);
        return ResponseEntity.ok(Collections.singletonMap("profilePictureUrl", url));
    }

    @PostMapping(value = "/profile/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload PDF resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        String url = studentService.uploadResume(currentUser.getId(), file);
        return ResponseEntity.ok(Collections.singletonMap("resumeUrl", url));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student dashboard statistics")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(studentService.getStudentDashboard(currentUser.getId()));
    }

    @GetMapping("/recommended-alumni")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get personalized recommended alumni based on skill overlap and interests")
    public ResponseEntity<List<RecommendedAlumniResponse>> getRecommendedAlumni(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendedAlumni(currentUser.getId(), limit));
    }
}
