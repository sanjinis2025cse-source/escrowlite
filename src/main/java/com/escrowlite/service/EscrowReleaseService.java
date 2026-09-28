package com.escrowlite.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.escrowlite.entity.EscrowRelease;
import com.escrowlite.entity.EscrowReleaseStatus;
import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.MilestoneStatus;
import com.escrowlite.entity.Submission;
import com.escrowlite.entity.SubmissionStatus;
import com.escrowlite.entity.Project;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.EscrowReleaseRepository;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.SubmissionRepository;

@Service
public class EscrowReleaseService {

    private final EscrowReleaseRepository escrowReleaseRepository;
    private final MilestoneRepository milestoneRepository;
    private final SubmissionRepository submissionRepository;
    private final CurrentUserService currentUserService;

    public EscrowReleaseService(
            EscrowReleaseRepository escrowReleaseRepository,
            MilestoneRepository milestoneRepository,
            SubmissionRepository submissionRepository,
            CurrentUserService currentUserService) {

        this.escrowReleaseRepository = escrowReleaseRepository;
        this.milestoneRepository = milestoneRepository;
        this.submissionRepository = submissionRepository;
        this.currentUserService = currentUserService;
    }

    public EscrowRelease releaseEscrow(Long milestoneId) {

        currentUserService.requireRole(UserRole.CLIENT);

        Milestone milestone = milestoneRepository
                .findById(milestoneId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Milestone not found with id: "
                                        + milestoneId
                        )
                );

        currentUserService.requireClientOwner(milestone.getProject());

        if (escrowReleaseRepository
                .existsByMilestoneId(milestoneId)) {

            throw new BadRequestException(
                    "Escrow has already been released for this milestone"
            );
        }

        List<Submission> submissions =
                submissionRepository
                        .findByMilestoneId(milestoneId);

        if (submissions.isEmpty()) {

            throw new BadRequestException(
                    "No submission found for this milestone"
            );
        }

        submissions.stream()
                .filter(submission ->
                        submission.getStatus()
                                == SubmissionStatus.APPROVED)
                .findFirst()
                .orElseThrow(() ->
                        new BadRequestException(
                                "Escrow can only be released after submission approval"
                        )
                );

        EscrowRelease release =
                new EscrowRelease();

        release.setAmount(milestone.getAmount());

        release.setReleasedAt(
                LocalDateTime.now()
        );

        release.setStatus(
                EscrowReleaseStatus.RELEASED
        );

        release.setMilestone(milestone);

        milestone.setStatus(
                MilestoneStatus.RELEASED
        );

        milestoneRepository.save(milestone);

        return escrowReleaseRepository.save(release);
    }

    public List<EscrowRelease> getAllReleases() {
        User user = currentUserService.getCurrentUser();
        return escrowReleaseRepository.findAll().stream()
                .filter(release -> currentUserService.isParticipant(user,
                        release.getMilestone().getProject()))
                .toList();
    }

    public EscrowRelease getReleaseById(Long id) {

        EscrowRelease release = escrowReleaseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Escrow release not found with id: "
                                        + id
                        )
                );
        currentUserService.requireProjectParticipant(release.getMilestone().getProject());
        return release;
    }

    public EscrowRelease getReleaseByMilestone(
            Long milestoneId) {

        Milestone milestone = milestoneRepository.findById(milestoneId).orElseThrow(() ->
                new ResourceNotFoundException("Milestone not found with id: " + milestoneId));
        currentUserService.requireProjectParticipant(milestone.getProject());
        return escrowReleaseRepository
                .findByMilestoneId(milestoneId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No escrow release found for milestone id: "
                                        + milestoneId
                        )
                );
    }
}
