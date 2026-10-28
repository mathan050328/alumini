package com.alumniconnect.controller;

import com.alumniconnect.dto.request.LoginRequest;
import com.alumniconnect.dto.request.RegisterRequest;
import com.alumniconnect.dto.response.AuthResponse;
import com.alumniconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new student or alumni account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT access token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password on first login or profile settings")
    public ResponseEntity<Void> changePassword(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.alumniconnect.security.UserPrincipal currentUser,
            @Valid @RequestBody com.alumniconnect.dto.request.ChangePasswordRequest request) {
        authService.changePassword(currentUser.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using Roll Number and registered email verification")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(
            @Valid @RequestBody com.alumniconnect.dto.request.ResetPasswordRequest request) {
        authService.resetPasswordSelfService(request);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password has been successfully reset."));
    }

    @org.springframework.web.bind.annotation.GetMapping("/check-email")
    @Operation(summary = "Check if email is valid format and available for registration")
    public ResponseEntity<java.util.Map<String, Object>> checkEmail(
            @org.springframework.web.bind.annotation.RequestParam("email") String email) {
        return ResponseEntity.ok(authService.checkEmailAvailability(email));
    }

    @PostMapping("/send-verification-otp")
    @Operation(summary = "Send email verification code to user email")
    public ResponseEntity<java.util.Map<String, Object>> sendVerificationOtp(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.alumniconnect.security.UserPrincipal currentUser,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String email = body != null && body.containsKey("email") ? body.get("email") : (currentUser != null ? currentUser.getEmail() : null);
        return ResponseEntity.ok(authService.sendVerificationOtp(email));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email using 6-digit OTP code")
    public ResponseEntity<java.util.Map<String, Object>> verifyEmail(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.alumniconnect.security.UserPrincipal currentUser,
            @RequestBody java.util.Map<String, String> body) {
        String email = body != null && body.containsKey("email") ? body.get("email") : (currentUser != null ? currentUser.getEmail() : null);
        String code = body != null ? body.get("code") : null;
        return ResponseEntity.ok(authService.verifyEmailOtp(email, code));
    }
}
