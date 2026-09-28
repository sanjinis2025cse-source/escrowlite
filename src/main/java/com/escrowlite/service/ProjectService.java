package com.escrowlite.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.escrowlite.entity.Project;
import com.escrowlite.entity.ProjectStatus;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.ProjectRepository;
import com.escrowlite.repository.UserRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          CurrentUserService currentUserService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    public Project createProject(Project project) {
        User client = currentUserService.requireRole(UserRole.CLIENT);
        if (project.getFreelancer() == null || project.getFreelancer().getId() == null) {
            throw new BadRequestException("Freelancer is required");
        }
        User freelancer = userRepository.findById(project.getFreelancer().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));
        if (freelancer.getRole() != UserRole.FREELANCER) {
            throw new BadRequestException("Selected freelancer must have FREELANCER role");
        }
        project.setClient(client);
        project.setFreelancer(freelancer);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        User user = currentUserService.getCurrentUser();
        return user.getRole() == UserRole.CLIENT
                ? projectRepository.findByClientId(user.getId())
                : projectRepository.findByFreelancerId(user.getId());
    }

    public Project getProjectById(Long id) {
        Project project = findProject(id);
        currentUserService.requireProjectParticipant(project);
        return project;
    }

    public List<Project> getProjectsByClient(Long clientId) {
        User user = currentUserService.requireRole(UserRole.CLIENT);
        if (!user.getId().equals(clientId)) throw new AccessDeniedException("You do not have access to these projects");
        return projectRepository.findByClientId(user.getId());
    }

    public List<Project> getProjectsByFreelancer(Long freelancerId) {
        User user = currentUserService.requireRole(UserRole.FREELANCER);
        if (!user.getId().equals(freelancerId)) throw new AccessDeniedException("You do not have access to these projects");
        return projectRepository.findByFreelancerId(user.getId());
    }

    public Project updateProjectStatus(Long id, ProjectStatus status) {
        Project project = findProject(id);
        currentUserService.requireClientOwner(project);
        if (status == null) throw new BadRequestException("Project status is required");
        project.setStatus(status);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        Project project = findProject(id);
        currentUserService.requireClientOwner(project);
        projectRepository.delete(project);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Project not found with id: " + id));
    }
}
