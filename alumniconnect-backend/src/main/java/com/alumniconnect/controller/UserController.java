package com.alumniconnect.controller;

import com.alumniconnect.dto.response.UserResponse;
import com.alumniconnect.entity.User;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.UserRepository;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and avatar management for all roles")
public class UserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .rollNumber(user.getRollNumber())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.getIsActive())
                .passwordChanged(user.getPasswordChanged())
                .isEmailVerified(user.getIsEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or change profile picture (Students, Alumni, Admins)")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "url", required = false) String url) {

        String photoUrl = authService.updateProfilePicture(currentUser.getId(), file, url);
        return ResponseEntity.ok(Collections.singletonMap("profilePictureUrl", photoUrl));
    }

    @PostMapping(value = "/profile-picture-url")
    @Operation(summary = "Set profile picture by direct URL (Students, Alumni, Admins)")
    public ResponseEntity<Map<String, String>> setProfilePictureUrl(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {

        String url = body != null ? (body.containsKey("url") ? body.get("url") : body.get("profilePictureUrl")) : null;
        String photoUrl = authService.updateProfilePicture(currentUser.getId(), null, url);
        return ResponseEntity.ok(Collections.singletonMap("profilePictureUrl", photoUrl));
    }
}
