package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.MentorshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipResponse {

    private Long id;
    private Long studentId;
    private Long studentUserId;
    private String studentName;
    private String studentEmail;
    private String studentProfilePictureUrl;
    private String studentDepartment;

    private Long alumniId;
    private Long alumniUserId;
    private String alumniName;
    private String alumniEmail;
    private String alumniProfilePictureUrl;
    private String alumniCompany;
    private String alumniJobTitle;

    private String message;
    private MentorshipStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;
}
