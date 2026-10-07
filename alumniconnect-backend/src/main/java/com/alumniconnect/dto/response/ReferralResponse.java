package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.ReferralStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralResponse {

    private Long id;
    private Long studentId;
    private Long studentUserId;
    private String studentName;
    private String studentEmail;
    private String studentResumeUrl;

    private Long alumniId;
    private Long alumniUserId;
    private String alumniName;
    private String alumniCompany;

    private Long jobId;
    private String jobTitle;
    private String jobCompany;

    private String message;
    private ReferralStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
}
