package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumniProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String profilePictureUrl;
    private String phone;
    private String department;
    private Integer graduationYear;
    private String currentCompany;
    private String jobTitle;
    private Integer yearsOfExperience;
    private String location;
    private String professionalBio;
    private String githubUrl;
    private String linkedinUrl;
    private VerificationStatus verificationStatus;
    private MentorshipAvailability mentorshipAvailability;
    private LocalDateTime verifiedAt;
    private Set<String> skills;
    private List<ExperienceResponse> experiences;
    private List<EducationResponse> educations;
    private List<CertificationResponse> certifications;
}
