package com.escrowlite.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Submission description is required")
    @Size(
            min = 10,
            max = 1000,
            message = "Submission description must be between 10 and 1000 characters"
    )
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Submission date is required")
    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Size(
            max = 500,
            message = "Review comment cannot exceed 500 characters"
    )
    @Column(length = 500)
    private String reviewComment;

    @NotNull(message = "Submission status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    @ManyToOne
    @JoinColumn(name = "milestone_id", nullable = false)
    @JsonIgnoreProperties({
            "submissions"
    })
    private Milestone milestone;

    public Submission() {
    }

    public Submission(
            Long id,
            String description,
            LocalDateTime submittedAt,
            String reviewComment,
            SubmissionStatus status,
            Milestone milestone
    ) {
        this.id = id;
        this.description = description;
        this.submittedAt = submittedAt;
        this.reviewComment = reviewComment;
        this.status = status;
        this.milestone = milestone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getReviewComment() {
        return reviewComment;
    }

    public void setReviewComment(String reviewComment) {
        this.reviewComment = reviewComment;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public Milestone getMilestone() {
        return milestone;
    }

    public void setMilestone(Milestone milestone) {
        this.milestone = milestone;
    }
}