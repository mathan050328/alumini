package com.alumniconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String rollNumber;
    private String email;
    private String fullName;
    private String role;
    private String profilePictureUrl;
    private Boolean passwordChanged;
}
