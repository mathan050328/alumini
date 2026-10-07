package com.alumniconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class AlumniExperienceRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 150, message = "Company cannot exceed 150 characters")
    private String company;

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String jobTitle;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isCurrent;
}
