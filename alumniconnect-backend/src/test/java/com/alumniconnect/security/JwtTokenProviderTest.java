package com.alumniconnect.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secretKey = "ThisIsASecretKeyForTestingAlumniConnectWhichIsAtLeast256BitsLongHS256Algorithm";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secretKey);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token and parse claims correctly")
    void testGenerateAndValidateToken() {
        Long userId = 101L;
        String email = "student@test.com";
        String role = "ROLE_STUDENT";

        String token = jwtTokenProvider.generateTokenFromUserId(userId, email, role);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromJWT(token));
        assertEquals(email, jwtTokenProvider.getEmailFromJWT(token));
    }

    @Test
    @DisplayName("Should return false when validating an invalid or corrupted JWT token")
    void testValidateInvalidToken() {
        String invalidToken = "invalid.token.structure";
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }

    @Test
    @DisplayName("Should reject expired JWT token")
    void testExpiredToken() {
        // Set expiration to -1000ms (already expired)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", -1000L);
        String token = jwtTokenProvider.generateTokenFromUserId(102L, "expired@test.com", "ROLE_ALUMNI");

        assertFalse(jwtTokenProvider.validateToken(token));
    }
}
