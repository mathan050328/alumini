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

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String emailTrimmed = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(emailTrimmed)) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        String rollNumber = request.getRollNumber() != null && !request.getRollNumber().isBlank()
                ? request.getRollNumber().trim().toUpperCase()
                : null;

        if (rollNumber != null && userRepository.existsByRollNumber(rollNumber)) {
            throw new DuplicateResourceException("User", "rollNumber", rollNumber);
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

        // Send welcome email & initial notification
        emailService.sendEmail(user.getEmail(), "Welcome to AlumniConnect!",
                "Hi " + user.getFullName() + ",\n\nWelcome to AlumniConnect! Your account has been registered successfully as " + role.name() + ".");

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
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail().trim();

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
}
