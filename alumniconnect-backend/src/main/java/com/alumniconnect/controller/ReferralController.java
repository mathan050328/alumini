package com.alumniconnect.controller;

import com.alumniconnect.dto.request.ReferralRequestDto;
import com.alumniconnect.dto.response.ReferralResponse;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.ReferralService;
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
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
@Tag(name = "Referrals", description = "Student-alumni job referral workflows")
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit a referral request to an alumni for a job")
    public ResponseEntity<ReferralResponse> requestReferral(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ReferralRequestDto request) {
        ReferralResponse response = referralService.requestReferral(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/sent")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student's sent referral requests")
    public ResponseEntity<List<ReferralResponse>> getSentReferrals(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(referralService.getStudentReferrals(currentUser.getId()));
    }

    @GetMapping("/received")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Get alumni's received referral requests")
    public ResponseEntity<List<ReferralResponse>> getReceivedReferrals(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(referralService.getAlumniReferrals(currentUser.getId()));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Accept a referral request")
    public ResponseEntity<ReferralResponse> acceptReferral(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(referralService.acceptReferral(currentUser.getId(), id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Reject a referral request")
    public ResponseEntity<ReferralResponse> rejectReferral(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(referralService.rejectReferral(currentUser.getId(), id));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Mark referral as completed (submitted to HR/company portal)")
    public ResponseEntity<ReferralResponse> completeReferral(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(referralService.completeReferral(currentUser.getId(), id));
    }
}
