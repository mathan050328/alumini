package com.alumniconnect.service;

import com.alumniconnect.dto.request.ReferralRequestDto;
import com.alumniconnect.dto.response.ReferralResponse;
import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.Job;
import com.alumniconnect.entity.ReferralRequest;
import com.alumniconnect.entity.StudentProfile;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.ReferralStatus;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.JobRepository;
import com.alumniconnect.repository.ReferralRequestRepository;
import com.alumniconnect.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRequestRepository referralRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public ReferralResponse requestReferral(Long studentUserId, ReferralRequestDto request) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        AlumniProfile alumni = alumniProfileRepository.findById(request.getAlumniId())
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "id", request.getAlumniId()));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", request.getJobId()));

        // Prevent duplicate active referral requests
        if (referralRequestRepository.existsByStudentIdAndAlumniIdAndJobIdAndStatus(
                student.getId(), alumni.getId(), job.getId(), ReferralStatus.PENDING)) {
            throw new DuplicateResourceException("You already have a pending referral request with this alumni for this job");
        }

        ReferralRequest referral = ReferralRequest.builder()
                .student(student)
                .alumni(alumni)
                .job(job)
                .message(request.getMessage())
                .status(ReferralStatus.PENDING)
                .build();

        referral = referralRequestRepository.save(referral);

        String studentName = student.getUser().getFullName();
        notificationService.createNotification(
                alumni.getUser().getId(),
                NotificationType.REFERRAL_REQUEST,
                "New Referral Request",
                studentName + " requested a referral for '" + job.getTitle() + "' at " + job.getCompany(),
                "/alumni/referrals"
        );

        emailService.sendEmail(
                alumni.getUser().getEmail(),
                "Referral Request from " + studentName,
                "Hi " + alumni.getUser().getFullName() + ",\n\n" + studentName + " has requested a referral for the role '" + job.getTitle() + "' at " + job.getCompany() + ".\n\nMessage: \"" + request.getMessage() + "\"\n\nReview this in your AlumniConnect dashboard."
        );

        return mapToResponse(referral);
    }

    @Transactional
    public ReferralResponse acceptReferral(Long alumniUserId, Long referralId) {
        ReferralRequest referral = referralRequestRepository.findById(referralId)
                .orElseThrow(() -> new ResourceNotFoundException("ReferralRequest", "id", referralId));

        if (!referral.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to respond to this referral request");
        }

        if (referral.getStatus() != ReferralStatus.PENDING) {
            throw new BadRequestException("Can only accept requests in PENDING status");
        }

        referral.setStatus(ReferralStatus.ACCEPTED);
        referral.setRespondedAt(LocalDateTime.now());
        referral = referralRequestRepository.save(referral);

        notificationService.createNotification(
                referral.getStudent().getUser().getId(),
                NotificationType.REFERRAL_ACCEPTED,
                "Referral Request Accepted!",
                referral.getAlumni().getUser().getFullName() + " accepted your referral request for '" + referral.getJob().getTitle() + "'!",
                "/student/referrals"
        );

        return mapToResponse(referral);
    }

    @Transactional
    public ReferralResponse rejectReferral(Long alumniUserId, Long referralId) {
        ReferralRequest referral = referralRequestRepository.findById(referralId)
                .orElseThrow(() -> new ResourceNotFoundException("ReferralRequest", "id", referralId));

        if (!referral.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to respond to this referral request");
        }

        if (referral.getStatus() != ReferralStatus.PENDING) {
            throw new BadRequestException("Can only reject requests in PENDING status");
        }

        referral.setStatus(ReferralStatus.REJECTED);
        referral.setRespondedAt(LocalDateTime.now());
        referral = referralRequestRepository.save(referral);

        notificationService.createNotification(
                referral.getStudent().getUser().getId(),
                NotificationType.REFERRAL_REJECTED,
                "Referral Request Update",
                referral.getAlumni().getUser().getFullName() + " was unable to provide a referral for '" + referral.getJob().getTitle() + "'.",
                "/student/referrals"
        );

        return mapToResponse(referral);
    }

    @Transactional
    public ReferralResponse completeReferral(Long alumniUserId, Long referralId) {
        ReferralRequest referral = referralRequestRepository.findById(referralId)
                .orElseThrow(() -> new ResourceNotFoundException("ReferralRequest", "id", referralId));

        if (!referral.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to update this referral");
        }

        referral.setStatus(ReferralStatus.COMPLETED);
        referral = referralRequestRepository.save(referral);

        return mapToResponse(referral);
    }

    @Transactional(readOnly = true)
    public List<ReferralResponse> getStudentReferrals(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        return referralRequestRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReferralResponse> getAlumniReferrals(Long alumniUserId) {
        AlumniProfile alumni = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", alumniUserId));

        return referralRequestRepository.findByAlumniId(alumni.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReferralResponse mapToResponse(ReferralRequest r) {
        StudentProfile s = r.getStudent();
        AlumniProfile a = r.getAlumni();
        Job j = r.getJob();

        return ReferralResponse.builder()
                .id(r.getId())
                .studentId(s.getId())
                .studentUserId(s.getUser().getId())
                .studentName(s.getUser().getFullName())
                .studentEmail(s.getUser().getEmail())
                .studentResumeUrl(s.getResumeUrl())
                .alumniId(a.getId())
                .alumniUserId(a.getUser().getId())
                .alumniName(a.getUser().getFullName())
                .alumniCompany(a.getCurrentCompany())
                .jobId(j.getId())
                .jobTitle(j.getTitle())
                .jobCompany(j.getCompany())
                .message(r.getMessage())
                .status(r.getStatus())
                .requestedAt(r.getRequestedAt())
                .respondedAt(r.getRespondedAt())
                .build();
    }
}
