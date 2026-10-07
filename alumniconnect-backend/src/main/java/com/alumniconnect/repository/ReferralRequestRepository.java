package com.alumniconnect.repository;

import com.alumniconnect.entity.ReferralRequest;
import com.alumniconnect.entity.enums.ReferralStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRequestRepository extends JpaRepository<ReferralRequest, Long> {

    List<ReferralRequest> findByStudentId(Long studentId);

    List<ReferralRequest> findByAlumniId(Long alumniId);

    boolean existsByStudentIdAndAlumniIdAndJobIdAndStatus(
            Long studentId, Long alumniId, Long jobId, ReferralStatus status);
}
