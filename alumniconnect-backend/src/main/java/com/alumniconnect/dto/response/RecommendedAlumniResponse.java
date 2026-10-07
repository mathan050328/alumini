package com.alumniconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedAlumniResponse {

    private Long alumniId;
    private Long userId;
    private String fullName;
    private String profilePictureUrl;
    private String currentCompany;
    private String jobTitle;
    private String location;
    private String department;
    private Integer graduationYear;
    private Double matchScore; // percentage or score 0-100
    private Set<String> matchingSkills;
    private Set<String> allSkills;
}
