package com.alumniconnect.repository;

import com.alumniconnect.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>,
        JpaSpecificationExecutor<Job> {

    List<Job> findByAlumniId(Long alumniId);

    Page<Job> findByIsActiveTrue(Pageable pageable);

    Long countByIsActiveTrue();
}
