package com.escrowlite.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.escrowlite.entity.Project;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.repository.ProjectRepository;
import com.escrowlite.repository.UserRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Project createProject(Project project) {

        if (project.getClient() == null ||
                project.getClient().getId() == null) {
            throw new RuntimeException("Client is required");
        }

        if (project.getFreelancer() == null ||
                project.getFreelancer().getId() == null) {
            throw new RuntimeException("Freelancer is required");
        }

        User client = userRepository.findById(
                project.getClient().getId()
        ).orElseThrow(() ->
                new RuntimeException("Client not found")
        );

        User freelancer = userRepository.findById(
                project.getFreelancer().getId()
        ).orElseThrow(() ->
                new RuntimeException("Freelancer not found")
        );

        if (client.getRole() != UserRole.CLIENT) {
            throw new RuntimeException(
                    "Selected client must have CLIENT role"
            );
        }

        if (freelancer.getRole() != UserRole.FREELANCER) {
            throw new RuntimeException(
                    "Selected freelancer must have FREELANCER role"
            );
        }

        project.setClient(client);
        project.setFreelancer(freelancer);

        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found with id: " + id
                        )
                );
    }

    public List<Project> getProjectsByClient(Long clientId) {

        return projectRepository.findByClientId(clientId);
    }

    public List<Project> getProjectsByFreelancer(Long freelancerId) {

        return projectRepository.findByFreelancerId(freelancerId);
    }

    public Project updateProjectStatus(
            Long id,
            com.escrowlite.entity.ProjectStatus status) {

        Project project = getProjectById(id);

        project.setStatus(status);

        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {

        Project project = getProjectById(id);

        projectRepository.delete(project);
    }
}