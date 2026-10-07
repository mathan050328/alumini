package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private Long id;
    private Long organizerId;
    private String organizerName;
    private String organizerEmail;
    private String organizerRole;

    private String title;
    private String description;
    private EventType eventType;
    private LocalDateTime eventDate;
    private String location;
    private Integer maxParticipants;
    private Long registeredCount;
    private LocalDateTime registrationDeadline;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Contextual field
    private Boolean isRegistered;
}
