package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumniSearchResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String profilePictureUrl;
    private String currentCompany;
    private String jobTitle;
    private Integer yearsOfExperience;
    private String location;
    private String department;
    private Integer graduationYear;
    private VerificationStatus verificationStatus;
    private MentorshipAvailability mentorshipAvailability;
    private Set<String> skills;
}
