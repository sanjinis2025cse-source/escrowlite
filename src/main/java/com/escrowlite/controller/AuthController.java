package com.escrowlite.controller;

import java.util.Collections;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.escrowlite.dto.LoginRequest;
import com.escrowlite.dto.LoginResponse;
import com.escrowlite.entity.User;
import com.escrowlite.repository.UserRepository;
import com.escrowlite.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            SecurityContextRepository securityContextRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        /*
         * First verify email and password using AuthService.
         */
        LoginResponse response =
                authService.login(request);

        /*
         * Find the authenticated user.
         */
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        /*
         * Create the user's role authority.
         *
         * Spring Security expects roles in the form:
         * ROLE_CLIENT
         * ROLE_FREELANCER
         */
        String role =
                "ROLE_" + user.getRole().name();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        Collections.singletonList(
                                new SimpleGrantedAuthority(role)
                        )
                );

        /*
         * Create Spring Security context.
         */
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);

        /*
         * Save authentication into HTTP session.
         */
        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<LoginResponse> logout(
            HttpServletRequest request) {

        SecurityContextHolder.clearContext();

        request.getSession(false);

        LoginResponse response =
                new LoginResponse();

        response.setSuccess(true);
        response.setMessage("Logout successful");

        return ResponseEntity.ok(response);
    }
}