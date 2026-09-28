package com.escrowlite.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.Project;
import com.escrowlite.entity.Submission;
import com.escrowlite.entity.SubmissionStatus;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.MilestoneRepository;
import com.escrowlite.repository.ProjectRepository;
import com.escrowlite.repository.SubmissionRepository;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;

    public SubmissionService(SubmissionRepository submissionRepository, MilestoneRepository milestoneRepository,
                             ProjectRepository projectRepository, CurrentUserService currentUserService) {
        this.submissionRepository = submissionRepository;
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.currentUserService = currentUserService;
    }

    public Submission createSubmission(Submission submission) {
        User freelancer = currentUserService.requireRole(UserRole.FREELANCER);
        if (submission.getMilestone() == null || submission.getMilestone().getId() == null) {
            throw new BadRequestException("Milestone is required");
        }
        Milestone milestone = findMilestone(submission.getMilestone().getId());
        if (milestone.getProject().getFreelancer() == null
                || !freelancer.getId().equals(milestone.getProject().getFreelancer().getId())) {
            throw new AccessDeniedException("You cannot submit work for this milestone");
        }
        if (milestone.getStatus() == com.escrowlite.entity.MilestoneStatus.RELEASED) {
            throw new BadRequestException("Work cannot be submitted after escrow has been released");
        }
        submission.setMilestone(milestone);
        submission.setSubmittedBy(freelancer);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setReviewComment(null);
        return submissionRepository.save(submission);
    }

    public List<Submission> getAllSubmissions() {
        User user = currentUserService.getCurrentUser();
        List<Project> projects = user.getRole() == UserRole.CLIENT
                ? projectRepository.findByClientId(user.getId())
                : projectRepository.findByFreelancerId(user.getId());
        return projects.stream()
                .flatMap(project -> milestoneRepository.findByProjectId(project.getId()).stream())
                .flatMap(milestone -> submissionRepository.findByMilestoneId(milestone.getId()).stream())
                .collect(Collectors.toList());
    }

    public Submission getSubmissionById(Long id) {
        Submission submission = findSubmission(id);
        currentUserService.requireProjectParticipant(submission.getMilestone().getProject());
        return submission;
    }

    public List<Submission> getSubmissionsByMilestone(Long milestoneId) {
        Milestone milestone = findMilestone(milestoneId);
        currentUserService.requireProjectParticipant(milestone.getProject());
        return submissionRepository.findByMilestoneId(milestoneId);
    }

    public Submission updateSubmissionStatus(Long id, SubmissionStatus status, String reviewComment) {
        Submission submission = findSubmission(id);
        currentUserService.requireClientOwner(submission.getMilestone().getProject());
        if (status == null) throw new BadRequestException("Submission status is required");
        if (status != SubmissionStatus.APPROVED && status != SubmissionStatus.REJECTED) {
            throw new BadRequestException("Submission can only be APPROVED or REJECTED during review");
        }
        if (submission.getStatus() != SubmissionStatus.SUBMITTED
                && submission.getStatus() != SubmissionStatus.REJECTED) {
            throw new BadRequestException("Only submitted or resubmitted work can be reviewed");
        }
        if (status == SubmissionStatus.REJECTED && (reviewComment == null || reviewComment.isBlank())) {
            throw new BadRequestException("Review comment is required when rejecting a submission");
        }
        submission.setStatus(status);
        submission.setReviewComment(status == SubmissionStatus.REJECTED ? reviewComment.trim() : null);
        return submissionRepository.save(submission);
    }

    public void deleteSubmission(Long id) {
        Submission submission = findSubmission(id);
        User user = currentUserService.requireRole(UserRole.FREELANCER);
        if (submission.getSubmittedBy() == null || !user.getId().equals(submission.getSubmittedBy().getId())) {
            throw new AccessDeniedException("You can only delete your own submissions");
        }
        if (submission.getStatus() != SubmissionStatus.SUBMITTED && submission.getStatus() != SubmissionStatus.REJECTED) {
            throw new BadRequestException("This submission can no longer be deleted");
        }
        submissionRepository.delete(submission);
    }

    private Milestone findMilestone(Long id) {
        return milestoneRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Milestone not found with id: " + id));
    }

    private Submission findSubmission(Long id) {
        return submissionRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Submission not found with id: " + id));
    }
}
