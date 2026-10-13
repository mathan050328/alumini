package com.alumniconnect.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StudentProfileRequest {

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;

    @Size(max = 100, message = "Department cannot exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Degree cannot exceed 100 characters")
    private String degree;

    @Min(value = 1970, message = "Graduation year must be valid")
    @Max(value = 2100, message = "Graduation year must be valid")
    private Integer graduationYear;

    private String bio;

    private String githubUrl;

    private String linkedinUrl;

    private String careerInterests;

    private List<String> skills;
}
