package com.alumniconnect.service;

import com.alumniconnect.dto.request.AlumniExperienceRequest;
import com.alumniconnect.dto.request.AlumniProfileRequest;
import com.alumniconnect.dto.response.*;
import com.alumniconnect.entity.AlumniExperience;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Skill;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.AlumniExperienceRepository;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.SkillRepository;
import com.alumniconnect.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumniService {

    private final AlumniProfileRepository alumniProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final AlumniExperienceRepository alumniExperienceRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public AlumniProfileResponse getProfileByUserId(Long userId) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public AlumniProfileResponse getProfileById(Long id) {
        AlumniProfile profile = alumniProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "id", id));
        return mapToResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse updateProfile(Long userId, AlumniProfileRequest request) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    return AlumniProfile.builder().user(user).build();
                });

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getCurrentCompany() != null) profile.setCurrentCompany(request.getCurrentCompany());
        if (request.getJobTitle() != null) profile.setJobTitle(request.getJobTitle());
        if (request.getYearsOfExperience() != null) profile.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getProfessionalBio() != null) profile.setProfessionalBio(request.getProfessionalBio());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getMentorshipAvailability() != null) profile.setMentorshipAvailability(request.getMentorshipAvailability());

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

        profile = alumniProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse addSkills(Long userId, List<String> skillNames) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));

        for (String rawName : skillNames) {
            String name = rawName.trim();
            if (name.isEmpty()) continue;
            Skill skill = skillRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> skillRepository.save(Skill.builder().name(name).build()));
            profile.getSkills().add(skill);
        }

        profile = alumniProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse removeSkill(Long userId, String skillIdentifier) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));

        profile.getSkills().removeIf(skill ->
                skill.getName().equalsIgnoreCase(skillIdentifier) ||
                String.valueOf(skill.getId()).equals(skillIdentifier));
        profile = alumniProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse removeSkill(Long userId, Long skillId) {
        return removeSkill(userId, String.valueOf(skillId));
    }

    @Transactional
    public AlumniProfileResponse addExperience(Long userId, AlumniExperienceRequest request) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));

        AlumniExperience experience = AlumniExperience.builder()
                .alumniProfile(profile)
                .company(request.getCompany())
                .jobTitle(request.getJobTitle())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent() != null && request.getIsCurrent())
                .build();

        alumniExperienceRepository.save(experience);
        profile.getExperiences().add(experience);

        return mapToResponse(profile);
    }

    @Transactional
    public AlumniProfileResponse removeExperience(Long userId, Long expId) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));

        profile.getExperiences().removeIf(exp -> exp.getId().equals(expId));
        alumniExperienceRepository.deleteById(expId);

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
    public AlumniProfileResponse toggleMentorshipAvailability(Long userId, MentorshipAvailability availability) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", userId));

        profile.setMentorshipAvailability(availability);
        profile = alumniProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AlumniSearchResponse> searchAlumni(
            String keyword,
            String company,
            String jobTitle,
            String skill,
            String location,
            Integer graduationYear,
            String department,
            Integer minExperience,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<AlumniProfile> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<AlumniProfile, User> userJoin = root.join("user", JoinType.INNER);

            // All registered active alumni are visible to students (exclude only rejected)
            predicates.add(cb.isTrue(userJoin.get("isActive")));
            predicates.add(cb.notEqual(root.get("verificationStatus"), VerificationStatus.REJECTED));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase().trim() + "%";
                Predicate nameMatch = cb.like(cb.lower(userJoin.get("fullName")), pattern);
                Predicate companyMatch = cb.like(cb.lower(root.get("currentCompany")), pattern);
                Predicate titleMatch = cb.like(cb.lower(root.get("jobTitle")), pattern);
                predicates.add(cb.or(nameMatch, companyMatch, titleMatch));
            }

            if (company != null && !company.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("currentCompany")), "%" + company.toLowerCase().trim() + "%"));
            }

            if (jobTitle != null && !jobTitle.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("jobTitle")), "%" + jobTitle.toLowerCase().trim() + "%"));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase().trim() + "%"));
            }

            if (department != null && !department.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("department")), "%" + department.toLowerCase().trim() + "%"));
            }

            if (graduationYear != null) {
                predicates.add(cb.equal(root.get("graduationYear"), graduationYear));
            }

            if (minExperience != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("yearsOfExperience"), minExperience));
            }

            if (skill != null && !skill.isBlank()) {
                Join<AlumniProfile, Skill> skillJoin = root.join("skills", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(skillJoin.get("name")), skill.toLowerCase().trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AlumniProfile> alumniPage = alumniProfileRepository.findAll(spec, pageable);

        List<AlumniSearchResponse> content = alumniPage.getContent().stream()
                .map(this::mapToSearchResponse)
                .collect(Collectors.toList());

        return PagedResponse.from(alumniPage, content);
    }

    private AlumniSearchResponse mapToSearchResponse(AlumniProfile profile) {
        Set<String> skills = profile.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toSet());

        User user = profile.getUser();

        return AlumniSearchResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .currentCompany(profile.getCurrentCompany())
                .jobTitle(profile.getJobTitle())
                .yearsOfExperience(profile.getYearsOfExperience())
                .location(profile.getLocation())
                .department(profile.getDepartment())
                .graduationYear(profile.getGraduationYear())
                .verificationStatus(profile.getVerificationStatus())
                .mentorshipAvailability(profile.getMentorshipAvailability())
                .skills(skills)
                .build();
    }

    private AlumniProfileResponse mapToResponse(AlumniProfile profile) {
        Set<String> skills = profile.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toSet());

        List<ExperienceResponse> experiences = profile.getExperiences().stream()
                .map(e -> ExperienceResponse.builder()
                        .id(e.getId())
                        .company(e.getCompany())
                        .jobTitle(e.getJobTitle())
                        .startDate(e.getStartDate())
                        .endDate(e.getEndDate())
                        .isCurrent(e.getIsCurrent())
                        .build())
                .collect(Collectors.toList());

        List<EducationResponse> educations = profile.getEducations().stream()
                .map(ed -> EducationResponse.builder()
                        .id(ed.getId())
                        .institution(ed.getInstitution())
                        .degree(ed.getDegree())
                        .yearOfCompletion(ed.getYearOfCompletion())
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

        return AlumniProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .rollNumber(user.getRollNumber())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .phone(profile.getPhone())
                .department(profile.getDepartment())
                .graduationYear(profile.getGraduationYear())
                .currentCompany(profile.getCurrentCompany())
                .jobTitle(profile.getJobTitle())
                .yearsOfExperience(profile.getYearsOfExperience())
                .location(profile.getLocation())
                .professionalBio(profile.getProfessionalBio())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .verificationStatus(profile.getVerificationStatus())
                .mentorshipAvailability(profile.getMentorshipAvailability())
                .verifiedAt(profile.getVerifiedAt())
                .skills(skills)
                .experiences(experiences)
                .educations(educations)
                .certifications(certifications)
                .build();
    }
}
