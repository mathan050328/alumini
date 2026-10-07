package com.alumniconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralRequestDto {

    @NotNull(message = "Alumni ID is required")
    private Long alumniId;

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;
}
