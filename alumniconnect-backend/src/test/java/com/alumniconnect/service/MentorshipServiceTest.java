package com.alumniconnect.service;

import com.alumniconnect.dto.request.MentorshipRequestDto;
import com.alumniconnect.dto.response.MentorshipResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Mentorship;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.MentorshipStatus;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.MentorshipRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MentorshipServiceTest {

    @Mock
    private MentorshipRepository mentorshipRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private AlumniProfileRepository alumniProfileRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private MentorshipService mentorshipService;

    private User studentUser;
    private User alumniUser;
    private StudentProfile studentProfile;
    private AlumniProfile verifiedAlumniProfile;
    private Mentorship mentorship;

    @BeforeEach
    void setUp() {
        studentUser = User.builder().id(10L).email("student@test.com").fullName("Rahul Verma").role(Role.ROLE_STUDENT).build();
        alumniUser = User.builder().id(20L).email("alumni@test.com").fullName("Sundar Pichai").role(Role.ROLE_ALUMNI).build();

        studentProfile = StudentProfile.builder().id(1L).user(studentUser).build();
        verifiedAlumniProfile = AlumniProfile.builder()
                .id(2L)
                .user(alumniUser)
                .verificationStatus(VerificationStatus.VERIFIED)
                .mentorshipAvailability(MentorshipAvailability.AVAILABLE)
                .currentCompany("Google")
                .jobTitle("Senior Software Engineer")
                .build();

        mentorship = Mentorship.builder()
                .id(100L)
                .student(studentProfile)
                .alumni(verifiedAlumniProfile)
                .message("Requesting mentorship")
                .status(MentorshipStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully request mentorship when alumni is verified and available")
    void testRequestMentorshipSuccess() {
        MentorshipRequestDto requestDto = MentorshipRequestDto.builder()
                .alumniId(2L)
                .message("Requesting career guidance")
                .build();

        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(studentProfile));
        when(alumniProfileRepository.findById(2L)).thenReturn(Optional.of(verifiedAlumniProfile));
        when(mentorshipRepository.findByStudentIdAndAlumniIdAndStatusIn(anyLong(), anyLong(), anyList())).thenReturn(Optional.empty());
        when(mentorshipRepository.save(any(Mentorship.class))).thenReturn(mentorship);

        MentorshipResponse response = mentorshipService.requestMentorship(10L, requestDto);

        assertNotNull(response);
        assertEquals(MentorshipStatus.PENDING, response.getStatus());
        verify(mentorshipRepository, times(1)).save(any(Mentorship.class));
        verify(notificationService, times(1)).createNotification(anyLong(), any(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reject mentorship request if alumni is unverified")
    void testRequestMentorshipUnverifiedAlumni() {
        verifiedAlumniProfile.setVerificationStatus(VerificationStatus.PENDING);
        MentorshipRequestDto requestDto = MentorshipRequestDto.builder().alumniId(2L).message("Hi").build();

        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(studentProfile));
        when(alumniProfileRepository.findById(2L)).thenReturn(Optional.of(verifiedAlumniProfile));

        assertThrows(BadRequestException.class, () -> mentorshipService.requestMentorship(10L, requestDto));
    }

    @Test
    @DisplayName("Should prevent duplicate active mentorship requests")
    void testPreventDuplicateActiveRequest() {
        MentorshipRequestDto requestDto = MentorshipRequestDto.builder().alumniId(2L).message("Hi").build();

        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(studentProfile));
        when(alumniProfileRepository.findById(2L)).thenReturn(Optional.of(verifiedAlumniProfile));
        when(mentorshipRepository.findByStudentIdAndAlumniIdAndStatusIn(anyLong(), anyLong(), anyList()))
                .thenReturn(Optional.of(mentorship));

        assertThrows(DuplicateResourceException.class, () -> mentorshipService.requestMentorship(10L, requestDto));
    }

    @Test
    @DisplayName("Should allow alumni to accept pending mentorship request")
    void testAcceptMentorship() {
        when(mentorshipRepository.findById(100L)).thenReturn(Optional.of(mentorship));
        when(mentorshipRepository.save(any(Mentorship.class))).thenReturn(mentorship);

        MentorshipResponse response = mentorshipService.acceptMentorship(20L, 100L);

        assertNotNull(response);
        assertEquals(MentorshipStatus.ACCEPTED, mentorship.getStatus());
        assertNotNull(mentorship.getRespondedAt());
    }
}
