package com.alumniconnect.controller;

import com.alumniconnect.dto.request.LoginRequest;
import com.alumniconnect.dto.request.RegisterRequest;
import com.alumniconnect.dto.response.AuthResponse;
import com.alumniconnect.security.CustomUserDetailsService;
import com.alumniconnect.security.JwtAuthenticationEntryPoint;
import com.alumniconnect.security.JwtTokenProvider;
import com.alumniconnect.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass Spring Security filter chain for pure controller unit test
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("POST /api/auth/register should return 201 Created on valid request")
    void testRegisterEndpointSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Rahul Verma")
                .email("rahul@alumniconnect.com")
                .password("Password@123")
                .role("STUDENT")
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("mocked.jwt.token")
                .userId(1L)
                .email("rahul@alumniconnect.com")
                .fullName("Rahul Verma")
                .role("ROLE_STUDENT")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.email").value("rahul@alumniconnect.com"))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));
    }

    @Test
    @DisplayName("POST /api/auth/register should return 400 Bad Request on invalid email")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Rahul Verma")
                .email("not-an-email")
                .password("short")
                .role("STUDENT")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 OK on valid credentials")
    void testLoginEndpointSuccess() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("rahul@alumniconnect.com")
                .password("Password@123")
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("mocked.jwt.token")
                .userId(1L)
                .email("rahul@alumniconnect.com")
                .fullName("Rahul Verma")
                .role("ROLE_STUDENT")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1));
    }
}
