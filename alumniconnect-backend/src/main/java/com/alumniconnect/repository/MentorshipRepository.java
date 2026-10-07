package com.alumniconnect.repository;

import com.alumniconnect.entity.Mentorship;
import com.alumniconnect.entity.enums.MentorshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {

    List<Mentorship> findByStudentId(Long studentId);

    List<Mentorship> findByAlumniId(Long alumniId);

    /**
     * Used to prevent duplicate active mentorship requests between same student-alumni pair.
     */
    Optional<Mentorship> findByStudentIdAndAlumniIdAndStatusIn(
            Long studentId, Long alumniId, List<MentorshipStatus> statuses);

    Long countByStatus(MentorshipStatus status);
}
