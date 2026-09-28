package com.escrowlite.service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.Submission;
import com.escrowlite.entity.SubmissionStatus;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            MilestoneRepository milestoneRepository) {

        this.submissionRepository = submissionRepository;
        this.milestoneRepository = milestoneRepository;
    }

    public Submission createSubmission(Submission submission) {

        if (submission.getMilestone() == null ||
                submission.getMilestone().getId() == null) {

            throw new BadRequestException(
                    "Milestone is required"
            );
        }

        Long milestoneId =
                submission.getMilestone().getId();

        Milestone milestone =
                milestoneRepository.findById(milestoneId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Milestone not found with id: "
                                                + milestoneId
                                )
                        );

        submission.setMilestone(milestone);

        if (submission.getSubmittedAt() == null) {
            submission.setSubmittedAt(
                    LocalDateTime.now()
            );
        }

        if (submission.getStatus() == null) {
            submission.setStatus(
                    SubmissionStatus.SUBMITTED
            );
        }

        return submissionRepository.save(submission);
    }

    public List<Submission> getAllSubmissions() {

        return submissionRepository.findAll();
    }

    public Submission getSubmissionById(Long id) {

        return submissionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Submission not found with id: "
                                        + id
                        )
                );
    }

    public List<Submission> getSubmissionsByMilestone(
            Long milestoneId) {

        if (!milestoneRepository.existsById(milestoneId)) {

            throw new ResourceNotFoundException(
                    "Milestone not found with id: "
                            + milestoneId
            );
        }

        return submissionRepository
                .findByMilestoneId(milestoneId);
    }

    public Submission updateSubmissionStatus(
            Long id,
            SubmissionStatus status,
            String reviewComment) {

        Submission submission =
                getSubmissionById(id);

        if (status == null) {

            throw new BadRequestException(
                    "Submission status is required"
            );
        }

        if (status != SubmissionStatus.APPROVED &&
                status != SubmissionStatus.REJECTED) {

            throw new BadRequestException(
                    "Submission can only be APPROVED or REJECTED during review"
            );
        }

        if (status == SubmissionStatus.REJECTED &&
                (reviewComment == null ||
                        reviewComment.isBlank())) {

            throw new BadRequestException(
                    "Review comment is required when rejecting a submission"
            );
        }

        submission.setStatus(status);
        submission.setReviewComment(reviewComment);

        return submissionRepository.save(submission);
    }

    public void deleteSubmission(Long id) {

        Submission submission =
                getSubmissionById(id);

        submissionRepository.delete(submission);
    }
}