package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {

    private Long id;
    private Long studentId;
    private Long studentUserId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentResumeUrl;
    private String studentDepartment;

    private Long jobId;
    private String jobTitle;
    private String jobCompany;

    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}
