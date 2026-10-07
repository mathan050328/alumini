package com.alumniconnect.dto.request;

import com.alumniconnect.entity.enums.MentorshipAvailability;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlumniProfileRequest {

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @Min(value = 1950, message = "Graduation year must be valid")
    @Max(value = 2100, message = "Graduation year must be valid")
    private Integer graduationYear;

    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String currentCompany;

    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String jobTitle;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Integer yearsOfExperience;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    private String professionalBio;

    private String githubUrl;

    private String linkedinUrl;

    private MentorshipAvailability mentorshipAvailability;
}
