package com.escrowlite.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.MilestoneStatus;
import com.escrowlite.entity.Project;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.ProjectRepository;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    public MilestoneService(MilestoneRepository milestoneRepository, ProjectRepository projectRepository,
                            CurrentUserService currentUserService) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.currentUserService = currentUserService;
    }

    public Milestone createMilestone(Milestone milestone) {
        if (milestone.getProject() == null || milestone.getProject().getId() == null) {
            throw new BadRequestException("Project is required");
        }
        Project project = findProject(milestone.getProject().getId());
        currentUserService.requireClientOwner(project);
        milestone.setProject(project);
        if (milestone.getStatus() == null) milestone.setStatus(MilestoneStatus.PENDING);
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getAllMilestones() {
        User user = currentUserService.getCurrentUser();
        List<Project> projects = user.getRole() == UserRole.CLIENT
                ? projectRepository.findByClientId(user.getId())
                : projectRepository.findByFreelancerId(user.getId());
        return projects.stream().flatMap(project -> milestoneRepository.findByProjectId(project.getId()).stream())
                .collect(Collectors.toList());
    }

    public Milestone getMilestoneById(Long id) {
        Milestone milestone = findMilestone(id);
        currentUserService.requireProjectParticipant(milestone.getProject());
        return milestone;
    }

    public List<Milestone> getMilestonesByProject(Long projectId) {
        Project project = findProject(projectId);
        currentUserService.requireProjectParticipant(project);
        return milestoneRepository.findByProjectId(projectId);
    }

    public Milestone updateMilestoneStatus(Long id, MilestoneStatus status) {
        Milestone milestone = findMilestone(id);
        User user = currentUserService.requireProjectParticipant(milestone.getProject());
        if (status == null) throw new BadRequestException("Milestone status is required");
        if (user.getRole() == UserRole.CLIENT) {
            if (status == MilestoneStatus.RELEASED || status == MilestoneStatus.APPROVED
                    || status == MilestoneStatus.REJECTED || status == MilestoneStatus.SUBMITTED) {
                throw new BadRequestException("This milestone status is controlled by its workflow");
            }
        } else {
            if (status != MilestoneStatus.IN_PROGRESS) {
                throw new AccessDeniedException("Freelancers may only mark an assigned milestone in progress");
            }
        }
        milestone.setStatus(status);
        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(Long id) {
        Milestone milestone = findMilestone(id);
        currentUserService.requireClientOwner(milestone.getProject());
        milestoneRepository.delete(milestone);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Project not found with id: " + id));
    }

    private Milestone findMilestone(Long id) {
        return milestoneRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Milestone not found with id: " + id));
    }
}
