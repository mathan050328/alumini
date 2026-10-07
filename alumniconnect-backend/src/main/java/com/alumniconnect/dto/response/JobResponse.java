package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {

    private Long id;
    private Long alumniId;
    private Long alumniUserId;
    private String alumniName;
    private String alumniCompany;
    private String alumniProfilePictureUrl;

    private String title;
    private String company;
    private String location;
    private EmploymentType employmentType;
    private String experienceRequired;
    private String requiredSkills;
    private String salaryRange;
    private String description;
    private String applicationUrl;
    private Boolean referralAvailable;
    private LocalDate postedDate;
    private LocalDate applicationDeadline;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Contextual fields for current student
    private Boolean isSaved;
    private Boolean hasApplied;
    private Long applicationCount;
}
