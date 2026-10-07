package com.alumniconnect.service;

import com.alumniconnect.dto.response.RecommendedAlumniResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Skill;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private AlumniProfileRepository alumniProfileRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private StudentProfile studentProfile;
    private AlumniProfile alumniProfile1;
    private AlumniProfile alumniProfile2;

    @BeforeEach
    void setUp() {
        Skill java = Skill.builder().id(1L).name("Java").build();
        Skill spring = Skill.builder().id(2L).name("Spring Boot").build();
        Skill python = Skill.builder().id(3L).name("Python").build();

        User studentUser = User.builder().id(1L).fullName("Rahul Student").role(Role.ROLE_STUDENT).build();
        studentProfile = StudentProfile.builder()
                .id(1L)
                .user(studentUser)
                .department("Computer Science")
                .careerInterests("Cloud Backend")
                .skills(new HashSet<>(Arrays.asList(java, spring)))
                .build();

        User alumniUser1 = User.builder().id(2L).fullName("Sundar Google").role(Role.ROLE_ALUMNI).build();
        alumniProfile1 = AlumniProfile.builder()
                .id(10L)
                .user(alumniUser1)
                .department("Computer Science")
                .currentCompany("Google")
                .jobTitle("Cloud Backend Architect")
                .verificationStatus(VerificationStatus.VERIFIED)
                .skills(new HashSet<>(Arrays.asList(java, spring)))
                .build();

        User alumniUser2 = User.builder().id(3L).fullName("Alex Data").role(Role.ROLE_ALUMNI).build();
        alumniProfile2 = AlumniProfile.builder()
                .id(11L)
                .user(alumniUser2)
                .department("Mechanical")
                .currentCompany("AutoCorp")
                .jobTitle("Data Analyst")
                .verificationStatus(VerificationStatus.VERIFIED)
                .skills(new HashSet<>(Collections.singletonList(python)))
                .build();
    }

    @Test
    @DisplayName("Should rank alumni by skill overlap, department, and career interests")
    void testRecommendationRanking() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        when(alumniProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED))
                .thenReturn(Arrays.asList(alumniProfile1, alumniProfile2));

        List<RecommendedAlumniResponse> results = recommendationService.getRecommendedAlumni(1L, 5);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        // Alumni 1 has high skill overlap (Java, Spring Boot) + same department + matching interest -> should rank 1st
        assertEquals(alumniProfile1.getId(), results.get(0).getAlumniId());
        assertTrue(results.get(0).getMatchScore() > 60.0);
    }
}
