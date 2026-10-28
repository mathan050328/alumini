package com.alumniconnect.service;

import com.alumniconnect.dto.request.StudentProfileRequest;
import com.alumniconnect.dto.request.StudentProjectRequest;
import com.alumniconnect.dto.response.CertificationResponse;
import com.alumniconnect.dto.response.StudentProfileResponse;
import com.alumniconnect.dto.response.StudentProjectResponse;
import com.alumniconnect.entity.Skill;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.StudentProject;
import com.alumniconnect.entity.User;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.SkillRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import com.alumniconnect.repository.StudentProjectRepository;
import com.alumniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final StudentProjectRepository studentProjectRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileById(Long profileId) {
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", profileId));
        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse updateProfile(Long userId, StudentProfileRequest request) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    return StudentProfile.builder().user(user).build();
                });

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getDegree() != null) profile.setDegree(request.getDegree());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getCareerInterests() != null) profile.setCareerInterests(request.getCareerInterests());

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            User user = profile.getUser();
            user.setEmail(request.getEmail().trim().toLowerCase());
            userRepository.save(user);
        }

        if (request.getSkills() != null) {
            Set<Skill> newSkills = new HashSet<>();
            for (String rawName : request.getSkills()) {
                String name = rawName.trim();
                if (name.isEmpty()) continue;
                Skill skill = skillRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(name).build()));
                newSkills.add(skill);
            }
            profile.setSkills(newSkills);
        }

        profile = studentProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse addSkills(Long userId, List<String> skillNames) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        for (String rawName : skillNames) {
            String name = rawName.trim();
            if (name.isEmpty()) continue;
            Skill skill = skillRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> skillRepository.save(Skill.builder().name(name).build()));
            profile.getSkills().add(skill);
        }

        profile = studentProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse removeSkill(Long userId, String skillIdentifier) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        profile.getSkills().removeIf(skill ->
                skill.getName().equalsIgnoreCase(skillIdentifier) ||
                String.valueOf(skill.getId()).equals(skillIdentifier));
        profile = studentProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse removeSkill(Long userId, Long skillId) {
        return removeSkill(userId, String.valueOf(skillId));
    }

    @Transactional
    public StudentProfileResponse addProject(Long userId, StudentProjectRequest request) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        StudentProject project = StudentProject.builder()
                .studentProfile(profile)
                .title(request.getTitle())
                .description(request.getDescription())
                .projectUrl(request.getProjectUrl())
                .build();

        studentProjectRepository.save(project);
        profile.getProjects().add(project);

        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse removeProject(Long userId, Long projectId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        profile.getProjects().removeIf(project -> project.getId().equals(projectId));
        studentProjectRepository.deleteById(projectId);

        return mapToResponse(profile);
    }

    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String fileUrl = fileStorageService.storeProfilePicture(file);
        user.setProfilePictureUrl(fileUrl);
        userRepository.save(user);
        return fileUrl;
    }

    @Transactional
    public String uploadResume(Long userId, MultipartFile file) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        String fileUrl = fileStorageService.storeResume(file);
        profile.setResumeUrl(fileUrl);
        studentProfileRepository.save(profile);
        return fileUrl;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboard(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));

        Map<String, Object> stats = new HashMap<>();
        stats.put("profile", mapToResponse(profile));
        stats.put("isProfileComplete", profile.getDepartment() != null && profile.getResumeUrl() != null);
        return stats;
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        Set<String> skills = profile.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toSet());

        List<StudentProjectResponse> projects = profile.getProjects().stream()
                .map(p -> StudentProjectResponse.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .projectUrl(p.getProjectUrl())
                        .build())
                .collect(Collectors.toList());

        List<CertificationResponse> certifications = profile.getCertifications().stream()
                .map(c -> CertificationResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .issuingOrganization(c.getIssuingOrganization())
                        .issueDate(c.getIssueDate())
                        .build())
                .collect(Collectors.toList());

        User user = profile.getUser();

        return StudentProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .rollNumber(user.getRollNumber())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .phone(profile.getPhone())
                .department(profile.getDepartment())
                .degree(profile.getDegree())
                .graduationYear(profile.getGraduationYear())
                .bio(profile.getBio())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .resumeUrl(profile.getResumeUrl())
                .careerInterests(profile.getCareerInterests())
                .skills(skills)
                .projects(projects)
                .certifications(certifications)
                .build();
    }
}
