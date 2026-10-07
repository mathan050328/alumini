package com.alumniconnect.service;

import com.alumniconnect.dto.request.MentorshipRequestDto;
import com.alumniconnect.dto.response.MentorshipResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Mentorship;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.MentorshipStatus;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.VerificationStatus;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.MentorshipRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorshipService {

    private final MentorshipRepository mentorshipRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public MentorshipResponse requestMentorship(Long studentUserId, MentorshipRequestDto request) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        AlumniProfile alumni = alumniProfileRepository.findById(request.getAlumniId())
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "id", request.getAlumniId()));

        if (alumni.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Cannot request mentorship from an unverified alumni");
        }

        if (alumni.getMentorshipAvailability() != MentorshipAvailability.AVAILABLE) {
            throw new BadRequestException("This alumni is currently unavailable for mentorship");
        }

        // Prevent duplicate active requests (PENDING or ACCEPTED)
        List<MentorshipStatus> activeStatuses = Arrays.asList(MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED);
        if (mentorshipRepository.findByStudentIdAndAlumniIdAndStatusIn(student.getId(), alumni.getId(), activeStatuses).isPresent()) {
            throw new DuplicateResourceException("An active mentorship request already exists with this alumni");
        }

        Mentorship mentorship = Mentorship.builder()
                .student(student)
                .alumni(alumni)
                .message(request.getMessage())
                .status(MentorshipStatus.PENDING)
                .build();

        mentorship = mentorshipRepository.save(mentorship);

        // Notify alumni
        String studentName = student.getUser().getFullName();
        notificationService.createNotification(
                alumni.getUser().getId(),
                NotificationType.MENTORSHIP_REQUEST,
                "New Mentorship Request",
                studentName + " has requested mentorship from you.",
                "/alumni/mentorships"
        );

        emailService.sendEmail(
                alumni.getUser().getEmail(),
                "New Mentorship Request from " + studentName,
                "Hi " + alumni.getUser().getFullName() + ",\n\n" + studentName + " has requested mentorship on AlumniConnect.\n\nMessage: \"" + request.getMessage() + "\"\n\nPlease visit your dashboard to respond."
        );

        return mapToResponse(mentorship);
    }

    @Transactional
    public MentorshipResponse acceptMentorship(Long alumniUserId, Long mentorshipId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship", "id", mentorshipId));

        if (!mentorship.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to respond to this mentorship request");
        }

        if (mentorship.getStatus() != MentorshipStatus.PENDING) {
            throw new BadRequestException("Can only accept requests in PENDING status");
        }

        mentorship.setStatus(MentorshipStatus.ACCEPTED);
        mentorship.setRespondedAt(LocalDateTime.now());
        mentorship = mentorshipRepository.save(mentorship);

        // Notify student
        String alumniName = mentorship.getAlumni().getUser().getFullName();
        notificationService.createNotification(
                mentorship.getStudent().getUser().getId(),
                NotificationType.MENTORSHIP_ACCEPTED,
                "Mentorship Request Accepted!",
                alumniName + " accepted your mentorship request. You can now message them!",
                "/student/mentorships"
        );

        emailService.sendEmail(
                mentorship.getStudent().getUser().getEmail(),
                "Mentorship Accepted by " + alumniName,
                "Congratulations! " + alumniName + " has accepted your mentorship request on AlumniConnect."
        );

        return mapToResponse(mentorship);
    }

    @Transactional
    public MentorshipResponse rejectMentorship(Long alumniUserId, Long mentorshipId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship", "id", mentorshipId));

        if (!mentorship.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to respond to this mentorship request");
        }

        if (mentorship.getStatus() != MentorshipStatus.PENDING) {
            throw new BadRequestException("Can only reject requests in PENDING status");
        }

        mentorship.setStatus(MentorshipStatus.REJECTED);
        mentorship.setRespondedAt(LocalDateTime.now());
        mentorship = mentorshipRepository.save(mentorship);

        notificationService.createNotification(
                mentorship.getStudent().getUser().getId(),
                NotificationType.MENTORSHIP_REJECTED,
                "Mentorship Request Update",
                mentorship.getAlumni().getUser().getFullName() + " was unable to accept your mentorship request at this time.",
                "/student/mentorships"
        );

        return mapToResponse(mentorship);
    }

    @Transactional
    public MentorshipResponse completeMentorship(Long userId, Long mentorshipId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship", "id", mentorshipId));

        boolean isStudent = mentorship.getStudent().getUser().getId().equals(userId);
        boolean isAlumni = mentorship.getAlumni().getUser().getId().equals(userId);

        if (!isStudent && !isAlumni) {
            throw new BadRequestException("You are not authorized to modify this mentorship");
        }

        if (mentorship.getStatus() != MentorshipStatus.ACCEPTED) {
            throw new BadRequestException("Only ACCEPTED mentorships can be marked as COMPLETED");
        }

        mentorship.setStatus(MentorshipStatus.COMPLETED);
        mentorship.setCompletedAt(LocalDateTime.now());
        mentorship = mentorshipRepository.save(mentorship);

        return mapToResponse(mentorship);
    }

    @Transactional
    public MentorshipResponse cancelMentorship(Long userId, Long mentorshipId) {
        Mentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship", "id", mentorshipId));

        boolean isStudent = mentorship.getStudent().getUser().getId().equals(userId);
        boolean isAlumni = mentorship.getAlumni().getUser().getId().equals(userId);

        if (!isStudent && !isAlumni) {
            throw new BadRequestException("You are not authorized to cancel this mentorship");
        }

        mentorship.setStatus(MentorshipStatus.CANCELLED);
        mentorship = mentorshipRepository.save(mentorship);

        return mapToResponse(mentorship);
    }

    @Transactional(readOnly = true)
    public List<MentorshipResponse> getStudentMentorships(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        return mentorshipRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MentorshipResponse> getAlumniMentorships(Long alumniUserId) {
        AlumniProfile alumni = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", alumniUserId));

        return mentorshipRepository.findByAlumniId(alumni.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MentorshipResponse mapToResponse(Mentorship m) {
        StudentProfile s = m.getStudent();
        AlumniProfile a = m.getAlumni();

        return MentorshipResponse.builder()
                .id(m.getId())
                .studentId(s.getId())
                .studentUserId(s.getUser().getId())
                .studentName(s.getUser().getFullName())
                .studentEmail(s.getUser().getEmail())
                .studentProfilePictureUrl(s.getUser().getProfilePictureUrl())
                .studentDepartment(s.getDepartment())
                .alumniId(a.getId())
                .alumniUserId(a.getUser().getId())
                .alumniName(a.getUser().getFullName())
                .alumniEmail(a.getUser().getEmail())
                .alumniProfilePictureUrl(a.getUser().getProfilePictureUrl())
                .alumniCompany(a.getCurrentCompany())
                .alumniJobTitle(a.getJobTitle())
                .message(m.getMessage())
                .status(m.getStatus())
                .requestedAt(m.getRequestedAt())
                .respondedAt(m.getRespondedAt())
                .completedAt(m.getCompletedAt())
                .build();
    }
}
