package com.alumniconnect.service;

import com.alumniconnect.dto.request.LoginRequest;
import com.alumniconnect.dto.request.RegisterRequest;
import com.alumniconnect.dto.response.AuthResponse;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import com.alumniconnect.repository.UserRepository;
import com.alumniconnect.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private AlumniProfileRepository alumniProfileRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("student@alumniconnect.com")
                .password("encoded_password")
                .fullName("Rahul Verma")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("student@alumniconnect.com")
                .password("Password@123")
                .fullName("Rahul Verma")
                .role("STUDENT")
                .build();
    }

    @Test
    @DisplayName("Should successfully register student and create profile shell")
    void testRegisterStudentSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateTokenFromUserId(anyLong(), anyString(), anyString())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("student@alumniconnect.com", response.getEmail());
        assertEquals("Rahul Verma", response.getFullName());
        assertEquals(Role.ROLE_STUDENT.name(), response.getRole());

        verify(studentProfileRepository, times(1)).save(any(StudentProfile.class));
        verify(emailService, times(1)).sendEmail(eq("student@alumniconnect.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("student@alumniconnect.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException for invalid role")
    void testRegisterInvalidRole() {
        registerRequest.setRole("INVALID_ROLE");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("Should authenticate user and return token on login")
    void testLoginSuccess() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("student@alumniconnect.com")
                .password("Password@123")
                .build();

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("valid.jwt.token");
        when(userRepository.findByEmail("student@alumniconnect.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getAccessToken());
        assertEquals(1L, response.getUserId());
        assertEquals("student@alumniconnect.com", response.getEmail());
    }
}
