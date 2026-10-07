package com.alumniconnect.repository;

import com.alumniconnect.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByEventDateAfterAndIsActiveTrueOrderByEventDateAsc(LocalDateTime date);

    List<Event> findByOrganizerId(Long organizerId);

    Long countByEventDateAfter(LocalDateTime date);
}
