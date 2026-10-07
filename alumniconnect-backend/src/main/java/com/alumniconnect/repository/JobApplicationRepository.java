package com.alumniconnect.repository;

import com.alumniconnect.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStudentId(Long studentId);

    List<JobApplication> findByJobId(Long jobId);

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    Long countByJobId(Long jobId);
}
