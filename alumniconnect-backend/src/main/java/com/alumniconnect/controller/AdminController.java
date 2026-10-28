package com.alumniconnect.controller;

import com.alumniconnect.dto.response.AlumniProfileResponse;
import com.alumniconnect.dto.response.DashboardStatsResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.dto.response.UserResponse;
import com.alumniconnect.service.AdminService;
import com.alumniconnect.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrator dashboard, user moderation, and alumni verification")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard analytics and metrics")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "List all platform users with optional search, role filter, and pagination")
    public ResponseEntity<PagedResponse<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return ResponseEntity.ok(adminService.getUsers(search, role, page, size));
    }

    @PostMapping(value = "/users/bulk-import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import student and alumni accounts via CSV file")
    public ResponseEntity<com.alumniconnect.dto.response.BulkImportResponse> bulkImportUsers(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(adminService.bulkImportUsers(file));
    }

    @GetMapping(value = "/users/template", produces = "text/csv")
    @Operation(summary = "Download sample CSV template for bulk user import")
    public ResponseEntity<byte[]> downloadUsersTemplate() {
        String csv = adminService.getCsvTemplate();
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"users_import_template.csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user account")
    public ResponseEntity<Void> suspendUser(@PathVariable Long id) {
        adminService.suspendUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Activate a user account")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/reset-password")
    @Operation(summary = "Reset user password to default institutional password (Password@123)")
    public ResponseEntity<Void> resetUserPassword(@PathVariable Long id) {
        adminService.resetUserPassword(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user account and profile")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/alumni/pending")
    @Operation(summary = "Get queue of alumni waiting for identity verification")
    public ResponseEntity<List<AlumniProfileResponse>> getPendingAlumni() {
        return ResponseEntity.ok(adminService.getPendingAlumniVerifications());
    }

    @PatchMapping("/alumni/{id}/verify")
    @Operation(summary = "Approve alumni verification")
    public ResponseEntity<AlumniProfileResponse> verifyAlumni(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.verifyAlumni(id));
    }

    @PatchMapping("/alumni/{id}/reject")
    @Operation(summary = "Reject alumni verification")
    public ResponseEntity<AlumniProfileResponse> rejectAlumni(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectAlumni(id));
    }

    @PatchMapping("/posts/{id}/visibility")
    @Operation(summary = "Toggle post visibility for moderation")
    public ResponseEntity<Void> togglePostVisibility(@PathVariable Long id) {
        adminService.togglePostVisibility(id);
        return ResponseEntity.ok().build();
    }
}
