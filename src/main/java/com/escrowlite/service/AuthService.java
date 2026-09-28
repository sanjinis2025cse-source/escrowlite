package com.escrowlite.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.escrowlite.dto.LoginRequest;
import com.escrowlite.dto.LoginResponse;
import com.escrowlite.entity.User;
import com.escrowlite.repository.UserRepository;
import com.escrowlite.exception.BadRequestException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException(
                                "Invalid email or password"));

        String enteredPassword = request.getPassword();
        String storedPassword = user.getPassword();

        boolean passwordMatches;

        /*
         * Check whether the stored password
         * is already a BCrypt hash.
         */
        if (storedPassword != null &&
                storedPassword.startsWith("$2")) {

            /*
             * Existing BCrypt password.
             */
            passwordMatches =
                    passwordEncoder.matches(
                            enteredPassword,
                            storedPassword
                    );

        } else {

            /*
             * Legacy plain-text password.
             *
             * This is only for existing users
             * created before BCrypt was introduced.
             */
            passwordMatches =
                    enteredPassword.equals(storedPassword);

            /*
             * Upgrade the old password to BCrypt
             * after successful login.
             */
            if (passwordMatches) {

                user.setPassword(
                        passwordEncoder.encode(
                                enteredPassword
                        )
                );

                userRepository.save(user);
            }
        }

        if (!passwordMatches) {

            throw new BadRequestException(
                    "Invalid email or password");
        }

        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
