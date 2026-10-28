package com.alumniconnect.service;

import com.alumniconnect.dto.request.LoginRequest;
import com.alumniconnect.dto.request.RegisterRequest;
import com.alumniconnect.dto.response.AuthResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import com.alumniconnect.repository.UserRepository;
import com.alumniconnect.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String rollNumber = request.getRollNumber() != null ? request.getRollNumber().trim().toUpperCase() : "";
        if (rollNumber.isBlank()) {
            throw new BadRequestException("Roll Number / User ID is required");
        }
        if (userRepository.existsByRollNumberIgnoreCase(rollNumber)) {
            throw new DuplicateResourceException("User", "rollNumber", rollNumber);
        }

        String emailTrimmed = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().toLowerCase().trim()
                : null;
        if (emailTrimmed != null && userRepository.existsByEmailIgnoreCase(emailTrimmed)) {
            throw new DuplicateResourceException("User", "email", emailTrimmed);
        }

        Role role;
        String requestedRole = request.getRole().toUpperCase().trim();
        if ("STUDENT".equals(requestedRole) || "ROLE_STUDENT".equals(requestedRole)) {
            role = Role.ROLE_STUDENT;
        } else if ("ALUMNI".equals(requestedRole) || "ROLE_ALUMNI".equals(requestedRole)) {
            role = Role.ROLE_ALUMNI;
        } else if ("ADMIN".equals(requestedRole) || "ROLE_ADMIN".equals(requestedRole)) {
            role = Role.ROLE_ADMIN;
        } else {
            throw new BadRequestException("Invalid role specified. Must be STUDENT or ALUMNI");
        }

        User user = User.builder()
                .email(emailTrimmed)
                .rollNumber(rollNumber)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(role)
                .isActive(true)
                .passwordChanged(true)
                .build();

        user = userRepository.save(user);

        // Auto-create initial profile shell based on role
        if (role == Role.ROLE_STUDENT) {
            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .build();
            studentProfileRepository.save(profile);
        } else if (role == Role.ROLE_ALUMNI) {
            AlumniProfile profile = AlumniProfile.builder()
                    .user(user)
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .verifiedAt(java.time.LocalDateTime.now())
                    .mentorshipAvailability(MentorshipAvailability.AVAILABLE)
                    .build();
            alumniProfileRepository.save(profile);
        }

        // Send welcome email if email provided & initial notification
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendEmail(user.getEmail(), "Welcome to AlumniConnect!",
                    "Hi " + user.getFullName() + ",\n\nWelcome to AlumniConnect! Your account has been registered successfully as " + role.name() + ".");
        }

        notificationService.createNotification(user.getId(), NotificationType.EVENT_REMINDER,
                "Welcome to AlumniConnect", "Your account was successfully created. Complete your profile to get started!", "/profile");

        String jwt = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .rollNumber(user.getRollNumber())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .passwordChanged(user.getPasswordChanged())
                .isEmailVerified(user.getIsEmailVerified())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        if (identifier.isBlank()) {
            throw new BadRequestException("User ID / Roll Number is required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier,
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmailIgnoreCaseOrRollNumberIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        return AuthResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .rollNumber(user.getRollNumber())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .passwordChanged(user.getPasswordChanged())
                .isEmailVerified(user.getIsEmailVerified())
                .build();
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChanged(true);
        userRepository.save(user);
    }

    @Transactional
    public void resetPasswordSelfService(com.alumniconnect.dto.request.ResetPasswordRequest request) {
        String identifier = request.getRollNumberOrEmail().trim();
        String recoveryEmail = request.getEmail().trim();

        User user = userRepository.findByEmailIgnoreCaseOrRollNumberIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new BadRequestException("No institutional account found with User ID: " + identifier));

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new BadRequestException("No recovery email has been set in your profile yet. Please contact the college administrator to reset your password.");
        }

        if (!user.getEmail().equalsIgnoreCase(recoveryEmail)) {
            throw new BadRequestException("Verification failed: The entered email does not match the recovery email saved in your profile section.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChanged(true);
        userRepository.save(user);
    }

    public Map<String, Object> checkEmailAvailability(String email) {
        Map<String, Object> result = new HashMap<>();
        if (email == null || email.isBlank()) {
            result.put("valid", false);
            result.put("available", false);
            result.put("message", "Email cannot be empty");
            return result;
        }

        String trimmed = email.toLowerCase().trim();
        String emailRegex = "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$";
        boolean isValid = Pattern.compile(emailRegex).matcher(trimmed).matches();

        if (!isValid) {
            result.put("valid", false);
            result.put("available", false);
            result.put("message", "Invalid email format");
            return result;
        }

        // DNS MX Record verification to check if the domain actually has active mail servers
        String domain = trimmed.substring(trimmed.indexOf('@') + 1);
        if (!hasValidMxRecord(domain)) {
            result.put("valid", false);
            result.put("available", false);
            result.put("message", "Domain @" + domain + " has no active mail server");
            return result;
        }

        boolean exists = userRepository.existsByEmailIgnoreCase(trimmed);
        result.put("valid", true);
        result.put("available", !exists);
        result.put("message", exists ? "Email is already registered" : "Email is valid & available");
        return result;
    }

    private boolean hasValidMxRecord(String domain) {
        if (domain == null || domain.isBlank()) return false;
        // Whitelist common test/dev domains
        if (domain.equalsIgnoreCase("localhost") || domain.endsWith(".local") || domain.equalsIgnoreCase("example.com")) {
            return true;
        }
        try {
            java.util.Hashtable<String, String> env = new java.util.Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            javax.naming.directory.DirContext ictx = new javax.naming.directory.InitialDirContext(env);
            javax.naming.directory.Attributes attrs = ictx.getAttributes(domain, new String[]{"MX"});
            javax.naming.directory.Attribute attr = attrs.get("MX");
            return (attr != null && attr.size() > 0);
        } catch (javax.naming.NameNotFoundException ex) {
            return false;
        } catch (Exception ex) {
            // If DNS lookup fails due to network/firewall, fail open so legitimate users aren't blocked
            return true;
        }
    }

    @Transactional
    public Map<String, Object> sendVerificationOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        String trimmed = email.toLowerCase().trim();
        User user = userRepository.findByEmailIgnoreCase(trimmed)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            Map<String, Object> res = new HashMap<>();
            res.put("verified", true);
            res.put("message", "Email is already verified");
            return res;
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setEmailVerificationCode(otp);
        user.setEmailVerificationExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Send email
        emailService.sendEmail(
                user.getEmail(),
                "AlumniConnect - Email Verification Code",
                "Hello " + user.getFullName() + ",\n\nYour AlumniConnect email verification code is: " + otp +
                "\n\nThis code will expire in 15 minutes.\n\nThank you,\nAlumniConnect Team"
        );

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Verification code sent to " + user.getEmail());
        res.put("email", user.getEmail());
        res.put("devOtp", otp); // included for local developer testing
        return res;
    }

    @Transactional
    public Map<String, Object> verifyEmailOtp(String email, String code) {
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            throw new BadRequestException("Email and verification code are required");
        }

        String trimmed = email.toLowerCase().trim();
        User user = userRepository.findByEmailIgnoreCase(trimmed)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getEmailVerificationCode() == null || !user.getEmailVerificationCode().equals(code.trim())) {
            throw new BadRequestException("Invalid verification code");
        }

        if (user.getEmailVerificationExpiry() != null && user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired. Please request a new one.");
        }

        user.setIsEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("verified", true);
        res.put("message", "Email verified successfully!");
        return res;
    }

    @Transactional
    public String updateProfilePicture(Long userId, MultipartFile file, String url) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String photoUrl;
        if (file != null && !file.isEmpty()) {
            photoUrl = fileStorageService.storeProfilePicture(file);
        } else if (url != null && !url.isBlank()) {
            photoUrl = url.trim();
        } else {
            throw new BadRequestException("Either an image file or an image URL must be provided");
        }

        user.setProfilePictureUrl(photoUrl);
        userRepository.save(user);
        return photoUrl;
    }
}
