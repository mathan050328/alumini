package com.alumniconnect.service;

import com.alumniconnect.dto.request.JobApplicationRequest;
import com.alumniconnect.dto.request.JobRequest;
import com.alumniconnect.dto.response.JobApplicationResponse;
import com.alumniconnect.dto.response.JobResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.entity.*;
import com.alumniconnect.entity.enums.ApplicationStatus;
import com.alumniconnect.entity.enums.EmploymentType;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.DuplicateResourceException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public JobResponse postJob(Long alumniUserId, JobRequest request) {
        AlumniProfile alumni = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", alumniUserId));

        Job job = Job.builder()
                .alumni(alumni)
                .title(request.getTitle())
                .company(request.getCompany())
                .location(request.getLocation())
                .employmentType(request.getEmploymentType())
                .experienceRequired(request.getExperienceRequired())
                .requiredSkills(request.getRequiredSkills())
                .salaryRange(request.getSalaryRange())
                .description(request.getDescription())
                .applicationUrl(request.getApplicationUrl())
                .referralAvailable(request.getReferralAvailable() != null ? request.getReferralAvailable() : false)
                .postedDate(LocalDate.now())
                .applicationDeadline(request.getApplicationDeadline())
                .isActive(true)
                .build();

        job = jobRepository.save(job);
        return mapToResponse(job, null);
    }

    @Transactional
    public JobResponse updateJob(Long userId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOwner = job.getAlumni().getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not authorized to update this job");
        }

        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setSalaryRange(request.getSalaryRange());
        job.setDescription(request.getDescription());
        job.setApplicationUrl(request.getApplicationUrl());
        if (request.getReferralAvailable() != null) job.setReferralAvailable(request.getReferralAvailable());
        if (request.getApplicationDeadline() != null) job.setApplicationDeadline(request.getApplicationDeadline());

        job = jobRepository.save(job);
        return mapToResponse(job, userId);
    }

    @Transactional
    public void deleteJob(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOwner = job.getAlumni().getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not authorized to delete this job");
        }

        job.setIsActive(false);
        jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long jobId, Long currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        return mapToResponse(job, currentUserId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> searchJobs(
            String keyword,
            String company,
            String location,
            EmploymentType employmentType,
            Boolean referralAvailable,
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long currentUserId) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isActive"), true));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase().trim() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), pattern);
                Predicate skillMatch = cb.like(cb.lower(root.get("requiredSkills")), pattern);
                predicates.add(cb.or(titleMatch, companyMatch, skillMatch));
            }

            if (company != null && !company.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("company")), "%" + company.toLowerCase().trim() + "%"));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase().trim() + "%"));
            }

            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            if (referralAvailable != null && referralAvailable) {
                predicates.add(cb.equal(root.get("referralAvailable"), true));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        List<JobResponse> content = jobPage.getContent().stream()
                .map(j -> mapToResponse(j, currentUserId))
                .collect(Collectors.toList());

        return PagedResponse.from(jobPage, content);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getMyPostedJobs(Long alumniUserId) {
        AlumniProfile alumni = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", alumniUserId));

        return jobRepository.findByAlumniId(alumni.getId()).stream()
                .map(j -> mapToResponse(j, alumniUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationResponse applyForJob(Long studentUserId, JobApplicationRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", request.getJobId()));

        if (!job.getIsActive()) {
            throw new BadRequestException("This job is no longer active");
        }

        if (jobApplicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            throw new DuplicateResourceException("You have already applied for this job");
        }

        JobApplication application = JobApplication.builder()
                .student(student)
                .job(job)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.APPLIED)
                .build();

        application = jobApplicationRepository.save(application);

        String studentName = student.getUser().getFullName();
        notificationService.createNotification(
                job.getAlumni().getUser().getId(),
                NotificationType.NEW_JOB,
                "New Job Application",
                studentName + " applied for '" + job.getTitle() + "'",
                "/alumni/jobs"
        );

        emailService.sendEmail(
                job.getAlumni().getUser().getEmail(),
                "New Application for " + job.getTitle(),
                "Hi " + job.getAlumni().getUser().getFullName() + ",\n\n" + studentName + " has applied for your job posting '" + job.getTitle() + "'. Review their application on AlumniConnect."
        );

        return mapToApplicationResponse(application);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getStudentApplications(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        return jobApplicationRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsForJob(Long alumniUserId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to view applications for this job");
        }

        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationResponse updateApplicationStatus(Long alumniUserId, Long applicationId, ApplicationStatus status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", applicationId));

        if (!application.getJob().getAlumni().getUser().getId().equals(alumniUserId)) {
            throw new BadRequestException("You are not authorized to update this application");
        }

        application.setStatus(status);
        application = jobApplicationRepository.save(application);

        notificationService.createNotification(
                application.getStudent().getUser().getId(),
                NotificationType.NEW_JOB,
                "Application Status Update",
                "Your application for '" + application.getJob().getTitle() + "' is now: " + status.name(),
                "/student/applications"
        );

        return mapToApplicationResponse(application);
    }

    @Transactional
    public void saveJob(Long studentUserId, Long jobId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!savedJobRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            SavedJob savedJob = SavedJob.builder()
                    .student(student)
                    .job(job)
                    .build();
            savedJobRepository.save(savedJob);
        }
    }

    @Transactional
    public void unsaveJob(Long studentUserId, Long jobId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        savedJobRepository.deleteByStudentIdAndJobId(student.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", studentUserId));

        return savedJobRepository.findByStudentId(student.getId()).stream()
                .map(sj -> mapToResponse(sj.getJob(), studentUserId))
                .collect(Collectors.toList());
    }

    private JobResponse mapToResponse(Job job, Long currentUserId) {
        AlumniProfile a = job.getAlumni();

        Boolean isSaved = false;
        Boolean hasApplied = false;

        if (currentUserId != null) {
            Optional<StudentProfile> studentOpt = studentProfileRepository.findByUserId(currentUserId);
            if (studentOpt.isPresent()) {
                Long studentId = studentOpt.get().getId();
                isSaved = savedJobRepository.existsByStudentIdAndJobId(studentId, job.getId());
                hasApplied = jobApplicationRepository.existsByStudentIdAndJobId(studentId, job.getId());
            }
        }

        Long appCount = jobApplicationRepository.countByJobId(job.getId());

        return JobResponse.builder()
                .id(job.getId())
                .alumniId(a.getId())
                .alumniUserId(a.getUser().getId())
                .alumniName(a.getUser().getFullName())
                .alumniCompany(a.getCurrentCompany())
                .alumniProfilePictureUrl(a.getUser().getProfilePictureUrl())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .experienceRequired(job.getExperienceRequired())
                .requiredSkills(job.getRequiredSkills())
                .salaryRange(job.getSalaryRange())
                .description(job.getDescription())
                .applicationUrl(job.getApplicationUrl())
                .referralAvailable(job.getReferralAvailable())
                .postedDate(job.getPostedDate())
                .applicationDeadline(job.getApplicationDeadline())
                .isActive(job.getIsActive())
                .createdAt(job.getCreatedAt())
                .isSaved(isSaved)
                .hasApplied(hasApplied)
                .applicationCount(appCount)
                .build();
    }

    private JobApplicationResponse mapToApplicationResponse(JobApplication app) {
        StudentProfile s = app.getStudent();
        Job j = app.getJob();

        return JobApplicationResponse.builder()
                .id(app.getId())
                .studentId(s.getId())
                .studentUserId(s.getUser().getId())
                .studentName(s.getUser().getFullName())
                .studentEmail(s.getUser().getEmail())
                .studentPhone(s.getPhone())
                .studentResumeUrl(s.getResumeUrl())
                .studentDepartment(s.getDepartment())
                .jobId(j.getId())
                .jobTitle(j.getTitle())
                .jobCompany(j.getCompany())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }
}
