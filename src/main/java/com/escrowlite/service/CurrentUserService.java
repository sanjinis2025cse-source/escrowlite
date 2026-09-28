package com.escrowlite.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.escrowlite.entity.Project;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.UserRepository;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationCredentialsNotFoundException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user was not found"));
    }

    public User requireRole(UserRole role) {
        User user = getCurrentUser();
        if (user.getRole() != role) {
            throw new AccessDeniedException("This action is not permitted for your role");
        }
        return user;
    }

    public User requireProjectParticipant(Project project) {
        User user = getCurrentUser();
        if (!isParticipant(user, project)) {
            throw new AccessDeniedException("You do not have access to this project");
        }
        return user;
    }

    public User requireClientOwner(Project project) {
        User user = requireRole(UserRole.CLIENT);
        if (project.getClient() == null || !project.getClient().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have access to this project");
        }
        return user;
    }

    public boolean isParticipant(User user, Project project) {
        return project != null && ((project.getClient() != null && user.getId().equals(project.getClient().getId()))
                || (project.getFreelancer() != null && user.getId().equals(project.getFreelancer().getId())));
    }
}
