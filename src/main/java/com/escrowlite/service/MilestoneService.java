package com.escrowlite.service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.MilestoneStatus;
import com.escrowlite.entity.Project;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public MilestoneService(
            MilestoneRepository milestoneRepository,
            ProjectRepository projectRepository
    ) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
    }

    public Milestone createMilestone(Milestone milestone) {

        if (milestone.getProject() == null ||
                milestone.getProject().getId() == null) {

            throw new BadRequestException(
                    "Project is required"
            );
        }

        Long projectId = milestone.getProject().getId();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with id: "
                                        + projectId
                        )
                );

        milestone.setProject(project);

        if (milestone.getStatus() == null) {
            milestone.setStatus(MilestoneStatus.PENDING);
        }

        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getAllMilestones() {

        return milestoneRepository.findAll();
    }

    public Milestone getMilestoneById(Long id) {

        return milestoneRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Milestone not found with id: "
                                        + id
                        )
                );
    }

    public List<Milestone> getMilestonesByProject(
            Long projectId
    ) {

        if (!projectRepository.existsById(projectId)) {

            throw new ResourceNotFoundException(
                    "Project not found with id: "
                            + projectId
            );
        }

        return milestoneRepository.findByProjectId(projectId);
    }

    public Milestone updateMilestoneStatus(
            Long id,
            MilestoneStatus status
    ) {

        Milestone milestone = getMilestoneById(id);

        if (status == null) {

            throw new BadRequestException(
                    "Milestone status is required"
            );
        }

        milestone.setStatus(status);

        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(Long id) {

        Milestone milestone = getMilestoneById(id);

        milestoneRepository.delete(milestone);
    }
}