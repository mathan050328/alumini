package com.alumniconnect.service;

import com.alumniconnect.dto.response.RecommendedAlumniResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Skill;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;

    @Transactional(readOnly = true)
    public List<RecommendedAlumniResponse> getRecommendedAlumni(Long studentUserId, int limit) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        Set<String> studentSkills = student.getSkills().stream()
                .map(s -> s.getName().toLowerCase().trim())
                .collect(Collectors.toSet());

        String studentDept = student.getDepartment() != null ? student.getDepartment().toLowerCase().trim() : "";
        String studentInterests = student.getCareerInterests() != null ? student.getCareerInterests().toLowerCase() : "";

        List<AlumniProfile> eligibleAlumni = alumniProfileRepository.findAll().stream()
                .filter(a -> a.getUser() != null && Boolean.TRUE.equals(a.getUser().getIsActive()) && a.getVerificationStatus() != VerificationStatus.REJECTED)
                .collect(Collectors.toList());

        List<RecommendedAlumniResponse> recommendations = new ArrayList<>();

        for (AlumniProfile alumni : eligibleAlumni) {
            Set<String> alumniSkills = alumni.getSkills().stream()
                    .map(s -> s.getName().toLowerCase().trim())
                    .collect(Collectors.toSet());

            // 1. Skill Overlap (up to 60 points)
            Set<String> matchingSkills = new HashSet<>(studentSkills);
            matchingSkills.retainAll(alumniSkills);

            double skillScore = 0.0;
            if (!studentSkills.isEmpty()) {
                skillScore = ((double) matchingSkills.size() / studentSkills.size()) * 60.0;
            }

            // 2. Department Match (20 points)
            double deptScore = 0.0;
            if (!studentDept.isEmpty() && alumni.getDepartment() != null &&
                    alumni.getDepartment().toLowerCase().trim().equals(studentDept)) {
                deptScore = 20.0;
            }

            // 3. Career Interest / Job Title alignment (20 points)
            double interestScore = 0.0;
            if (!studentInterests.isEmpty() && alumni.getJobTitle() != null) {
                String title = alumni.getJobTitle().toLowerCase();
                if (studentInterests.contains(title) || title.contains(studentInterests)) {
                    interestScore = 20.0;
                }
            }

            double totalScore = Math.min(100.0, skillScore + deptScore + interestScore);

            // Keep only relevant matches (score > 10) or provide top items if none
            if (totalScore > 10.0 || matchingSkills.size() > 0) {
                User user = alumni.getUser();

                Set<String> displayMatchingSkills = alumni.getSkills().stream()
                        .filter(s -> studentSkills.contains(s.getName().toLowerCase().trim()))
                        .map(Skill::getName)
                        .collect(Collectors.toSet());

                Set<String> displayAllSkills = alumni.getSkills().stream()
                        .map(Skill::getName)
                        .collect(Collectors.toSet());

                recommendations.add(RecommendedAlumniResponse.builder()
                        .alumniId(alumni.getId())
                        .userId(user.getId())
                        .fullName(user.getFullName())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .currentCompany(alumni.getCurrentCompany())
                        .jobTitle(alumni.getJobTitle())
                        .location(alumni.getLocation())
                        .department(alumni.getDepartment())
                        .graduationYear(alumni.getGraduationYear())
                        .matchScore(Math.round(totalScore * 10.0) / 10.0)
                        .matchingSkills(displayMatchingSkills)
                        .allSkills(displayAllSkills)
                        .build());
            }
        }

        // Sort by match score descending and limit results
        return recommendations.stream()
                .sorted(Comparator.comparingDouble(RecommendedAlumniResponse::getMatchScore).reversed())
                .limit(limit > 0 ? limit : 10)
                .collect(Collectors.toList());
    }
}
