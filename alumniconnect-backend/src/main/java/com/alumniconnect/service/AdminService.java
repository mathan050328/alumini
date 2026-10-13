package com.alumniconnect.service;

import com.alumniconnect.dto.response.*;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Post;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.MentorshipStatus;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final MentorshipRepository mentorshipRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EventRepository eventRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long totalStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        Long totalAlumni = userRepository.countByRole(Role.ROLE_ALUMNI);
        Long verifiedAlumni = alumniProfileRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        Long pendingVerifications = alumniProfileRepository.countByVerificationStatus(VerificationStatus.PENDING);
        Long activeMentorships = mentorshipRepository.countByStatus(MentorshipStatus.ACCEPTED);
        Long totalJobs = jobRepository.countByIsActiveTrue();
        Long totalApplications = jobApplicationRepository.count();
        Long upcomingEvents = eventRepository.countByEventDateAfter(LocalDateTime.now());

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalAlumni(totalAlumni)
                .verifiedAlumni(verifiedAlumni)
                .pendingVerifications(pendingVerifications)
                .activeMentorships(activeMentorships)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .upcomingEvents(upcomingEvents)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(int page, int size) {
        return getUsers(null, null, page, size);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(String search, String roleStr, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase().trim() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);
                predicates.add(cb.or(nameMatch, emailMatch));
            }

            if (roleStr != null && !roleStr.isBlank()) {
                try {
                    String normRole = roleStr.toUpperCase().trim();
                    if (!normRole.startsWith("ROLE_")) {
                        normRole = "ROLE_" + normRole;
                    }
                    Role roleEnum = Role.valueOf(normRole);
                    predicates.add(cb.equal(root.get("role"), roleEnum));
                } catch (IllegalArgumentException ignored) {
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<UserResponse> content = userPage.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return PagedResponse.from(userPage, content);
    }

    @Transactional
    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<AlumniProfileResponse> getPendingAlumniVerifications() {
        return alumniProfileRepository.findByVerificationStatus(VerificationStatus.PENDING).stream()
                .map(this::mapToAlumniResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlumniProfileResponse verifyAlumni(Long alumniId) {
        AlumniProfile alumni = alumniProfileRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "id", alumniId));

        alumni.setVerificationStatus(VerificationStatus.VERIFIED);
        alumni.setVerifiedAt(LocalDateTime.now());
        alumni = alumniProfileRepository.save(alumni);

        // Notify alumni
        notificationService.createNotification(
                alumni.getUser().getId(),
                NotificationType.EVENT_REMINDER,
                "Profile Verified! 🎉",
                "Your alumni account has been verified by the administrator. You now appear in public searches!",
                "/alumni/profile"
        );

        emailService.sendEmail(
                alumni.getUser().getEmail(),
                "Your Alumni Account is Verified!",
                "Hi " + alumni.getUser().getFullName() + ",\n\nGreat news! Your AlumniConnect account has been verified by the administrator."
        );

        return mapToAlumniResponse(alumni);
    }

    @Transactional
    public AlumniProfileResponse rejectAlumni(Long alumniId) {
        AlumniProfile alumni = alumniProfileRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "id", alumniId));

        alumni.setVerificationStatus(VerificationStatus.REJECTED);
        alumni = alumniProfileRepository.save(alumni);

        notificationService.createNotification(
                alumni.getUser().getId(),
                NotificationType.EVENT_REMINDER,
                "Profile Verification Update",
                "Your alumni verification could not be approved at this time.",
                "/alumni/profile"
        );

        return mapToAlumniResponse(alumni);
    }

    @Transactional
    public void togglePostVisibility(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        post.setIsVisible(!post.getIsVisible());
        postRepository.save(post);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .rollNumber(user.getRollNumber())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.getIsActive())
                .passwordChanged(user.getPasswordChanged())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AlumniProfileResponse mapToAlumniResponse(AlumniProfile profile) {
        User user = profile.getUser();
        return AlumniProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
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
                .verificationStatus(profile.getVerificationStatus())
                .mentorshipAvailability(profile.getMentorshipAvailability())
                .verifiedAt(profile.getVerifiedAt())
                .build();
    }
}
