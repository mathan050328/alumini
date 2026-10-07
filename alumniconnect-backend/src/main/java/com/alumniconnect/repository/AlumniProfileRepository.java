package com.alumniconnect.repository;

import com.alumniconnect.entity.AlumniProfile;
import com.alumniconnect.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Extends JpaSpecificationExecutor to support dynamic alumni search
 * with multiple optional filter criteria (company, skill, location, etc.)
 */
@Repository
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long>,
        JpaSpecificationExecutor<AlumniProfile> {

    Optional<AlumniProfile> findByUserId(Long userId);

    Optional<AlumniProfile> findByUserEmail(String email);

    List<AlumniProfile> findByVerificationStatus(VerificationStatus status);

    Long countByVerificationStatus(VerificationStatus status);

    boolean existsByUserId(Long userId);
}
