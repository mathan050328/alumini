package com.alumniconnect.dto.request;

import com.alumniconnect.entity.enums.EmploymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Company is required")
    @Size(max = 150, message = "Company cannot exceed 150 characters")
    private String company;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    private String experienceRequired;

    private String requiredSkills;

    private String salaryRange;

    @NotBlank(message = "Job description is required")
    private String description;

    private String applicationUrl;

    private Boolean referralAvailable;

    private LocalDate applicationDeadline;
}
