package com.alumniconnect.service;

import com.alumniconnect.dto.response.*;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Post;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.MentorshipStatus;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.criteria.Predicate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final MentorshipRepository mentorshipRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EventRepository eventRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;
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
                Predicate rollMatch = cb.like(cb.lower(root.get("rollNumber")), pattern);
                predicates.add(cb.or(nameMatch, emailMatch, rollMatch));
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

    @Transactional
    public void resetUserPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setPassword(passwordEncoder.encode("Password@123"));
        user.setPasswordChanged(false);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ROLE_ADMIN && "ADMIN01".equalsIgnoreCase(user.getRollNumber())) {
            throw new BadRequestException("Primary system administrator account cannot be deleted.");
        }

        notificationRepository.deleteByUserId(userId);
        eventRegistrationRepository.deleteByUserId(userId);
        postLikeRepository.deleteByUserId(userId);
        commentRepository.deleteByUserId(userId);

        studentProfileRepository.findByUserId(userId).ifPresent(studentProfileRepository::delete);
        alumniProfileRepository.findByUserId(userId).ifPresent(alumniProfileRepository::delete);

        userRepository.delete(user);
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
                .isEmailVerified(user.getIsEmailVerified())
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

    public BulkImportResponse bulkImportUsers(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV file must not be empty");
        }

        List<String> createdUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        Set<String> seenRollNumbers = new HashSet<>();
        Set<String> seenEmails = new HashSet<>();
        int createdCount = 0;
        int skippedCount = 0;
        int lineNumber = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                // Handle CSV line splitting
                String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (parts.length < 4) {
                    if (lineNumber == 1) continue; // Skip malformed header
                    errors.add("Line " + lineNumber + ": Insufficient columns (expected at least rollNumber, fullName, email, role)");
                    skippedCount++;
                    continue;
                }

                String rollNumber = cleanField(parts[0]).toUpperCase();
                String fullName = cleanField(parts[1]);
                String email = cleanField(parts[2]).toLowerCase();
                String roleStr = cleanField(parts[3]).toUpperCase();
                String department = parts.length > 4 ? cleanField(parts[4]) : "";
                String graduationYearStr = parts.length > 5 ? cleanField(parts[5]) : "";

                // Check if this is the header row
                if (lineNumber == 1 && (rollNumber.equalsIgnoreCase("ROLLNUMBER") || rollNumber.equalsIgnoreCase("ROLL_NUMBER") || rollNumber.contains("ROLL") || fullName.equalsIgnoreCase("FULLNAME"))) {
                    continue;
                }

                if (rollNumber.isBlank() || email.isBlank() || fullName.isBlank()) {
                    errors.add("Line " + lineNumber + ": Missing required field (rollNumber, fullName, or email)");
                    skippedCount++;
                    continue;
                }

                // Check batch duplicates inside the same CSV file
                if (seenRollNumbers.contains(rollNumber)) {
                    errors.add("Line " + lineNumber + ": Roll Number " + rollNumber + " duplicated in CSV file (Skipped)");
                    skippedCount++;
                    continue;
                }
                if (seenEmails.contains(email)) {
                    errors.add("Line " + lineNumber + ": Email " + email + " duplicated in CSV file (Skipped)");
                    skippedCount++;
                    continue;
                }

                // Check database duplicates (case-insensitive)
                if (userRepository.existsByRollNumberIgnoreCase(rollNumber)) {
                    errors.add("Roll Number " + rollNumber + " already exists in system (Skipped)");
                    skippedCount++;
                    continue;
                }

                if (userRepository.existsByEmailIgnoreCase(email)) {
                    errors.add("Email " + email + " already exists in system (Skipped)");
                    skippedCount++;
                    continue;
                }

                seenRollNumbers.add(rollNumber);
                seenEmails.add(email);

                Role role;
                if (roleStr.contains("ALUMNI")) {
                    role = Role.ROLE_ALUMNI;
                } else {
                    role = Role.ROLE_STUDENT;
                }

                Integer graduationYear = null;
                if (!graduationYearStr.isBlank()) {
                    try {
                        graduationYear = Integer.parseInt(graduationYearStr);
                    } catch (NumberFormatException ignored) {}
                }

                // Default institutional password
                String defaultPassword = "Password@123";

                try {
                    User newUser = User.builder()
                            .rollNumber(rollNumber)
                            .fullName(fullName)
                            .email(email)
                            .password(passwordEncoder.encode(defaultPassword))
                            .role(role)
                            .isActive(true)
                            .passwordChanged(false)
                            .isEmailVerified(true)
                            .build();

                    newUser = userRepository.save(newUser);

                    if (role == Role.ROLE_STUDENT) {
                        StudentProfile studentProfile = StudentProfile.builder()
                                .user(newUser)
                                .department(department.isBlank() ? "General" : department)
                                .degree("Bachelor of Technology")
                                .graduationYear(graduationYear != null ? graduationYear : java.time.Year.now().getValue())
                                .build();
                        studentProfileRepository.save(studentProfile);
                    } else {
                        AlumniProfile alumniProfile = AlumniProfile.builder()
                                .user(newUser)
                                .department(department.isBlank() ? "General" : department)
                                .graduationYear(graduationYear != null ? graduationYear : java.time.Year.now().getValue() - 2)
                                .verificationStatus(VerificationStatus.VERIFIED)
                                .verifiedAt(LocalDateTime.now())
                                .build();
                        alumniProfileRepository.save(alumniProfile);
                    }

                    createdCount++;
                    createdUsers.add(rollNumber + " - " + fullName + " (" + role.name().replace("ROLE_", "") + ")");
                } catch (Exception rowEx) {
                    errors.add("Roll Number " + rollNumber + ": Failed to provision - " + (rowEx.getCause() != null ? rowEx.getCause().getMessage() : rowEx.getMessage()));
                    skippedCount++;
                }
            }

        } catch (java.io.IOException e) {
            throw new BadRequestException("Error reading CSV file: " + e.getMessage());
        }

        return BulkImportResponse.builder()
                .totalProcessed(createdCount + skippedCount)
                .createdCount(createdCount)
                .skippedCount(skippedCount)
                .createdUsers(createdUsers)
                .errors(errors)
                .build();
    }

    public String getCsvTemplate() {
        return "rollNumber,fullName,email,role,department,graduationYear\n" +
               "22CS101,Aakash Sharma,aakash.sharma@college.edu,STUDENT,Computer Science and Engineering,2026\n" +
               "22CS102,Deepa Nair,deepa.nair@college.edu,STUDENT,Computer Science and Engineering,2026\n" +
               "19IT045,Vignesh K,vignesh.k@gmail.com,ALUMNI,Information Technology,2023\n";
    }

    private String cleanField(String raw) {
        if (raw == null) return "";
        String s = raw.trim();
        while (s.startsWith("\uFEFF") || s.startsWith("\u200B")) {
            s = s.substring(1).trim();
        }
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1).trim();
        }
        while (s.startsWith("\uFEFF") || s.startsWith("\u200B")) {
            s = s.substring(1).trim();
        }
        return s;
    }
}
