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

    public EscrowReleaseService(
            EscrowReleaseRepository escrowReleaseRepository,
            MilestoneRepository milestoneRepository,
            SubmissionRepository submissionRepository) {

        this.escrowReleaseRepository = escrowReleaseRepository;
        this.milestoneRepository = milestoneRepository;
        this.submissionRepository = submissionRepository;
    }

    public EscrowRelease releaseEscrow(Long milestoneId) {

        Milestone milestone = milestoneRepository
                .findById(milestoneId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Milestone not found with id: "
                                        + milestoneId
                        )
                );

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

        return escrowReleaseRepository.findAll();
    }

    public EscrowRelease getReleaseById(Long id) {

        return escrowReleaseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Escrow release not found with id: "
                                        + id
                        )
                );
    }

    public EscrowRelease getReleaseByMilestone(
            Long milestoneId) {

        if (!milestoneRepository.existsById(milestoneId)) {

            throw new ResourceNotFoundException(
                    "Milestone not found with id: "
                            + milestoneId
            );
        }

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