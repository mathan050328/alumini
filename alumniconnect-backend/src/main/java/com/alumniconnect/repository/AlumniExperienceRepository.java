package com.alumniconnect.repository;

import com.alumniconnect.entity.AlumniExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlumniExperienceRepository extends JpaRepository<AlumniExperience, Long> {
    List<AlumniExperience> findByAlumniProfileId(Long alumniProfileId);
}
