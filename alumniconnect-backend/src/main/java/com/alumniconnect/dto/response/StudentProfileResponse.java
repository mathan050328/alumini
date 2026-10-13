package com.alumniconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {

    private Long id;
    private Long userId;
    private String rollNumber;
    private String fullName;
    private String email;
    private String profilePictureUrl;
    private String phone;
    private String department;
    private String degree;
    private Integer graduationYear;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String resumeUrl;
    private String careerInterests;
    private Set<String> skills;
    private List<StudentProjectResponse> projects;
    private List<CertificationResponse> certifications;
}
