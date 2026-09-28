package com.escrowlite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.escrowlite.entity.Submission;
import com.escrowlite.entity.SubmissionStatus;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    List<Submission> findByMilestoneId(Long milestoneId);

    List<Submission> findByStatus(SubmissionStatus status);
}