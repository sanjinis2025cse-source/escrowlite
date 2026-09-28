package com.escrowlite.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.escrowlite.entity.Submission;
import com.escrowlite.entity.SubmissionStatus;
import com.escrowlite.service.SubmissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(
            SubmissionService submissionService) {

        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(
            @Valid @RequestBody Submission submission) {

        Submission createdSubmission =
                submissionService.createSubmission(
                        submission
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdSubmission);
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {

        return ResponseEntity.ok(
                submissionService.getAllSubmissions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                submissionService.getSubmissionById(id)
        );
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<List<Submission>>
    getSubmissionsByMilestone(
            @PathVariable Long milestoneId) {

        return ResponseEntity.ok(
                submissionService
                        .getSubmissionsByMilestone(
                                milestoneId
                        )
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Submission>
    updateSubmissionStatus(
            @PathVariable Long id,
            @RequestParam SubmissionStatus status,
            @RequestParam(required = false)
            String reviewComment) {

        return ResponseEntity.ok(
                submissionService.updateSubmissionStatus(
                        id,
                        status,
                        reviewComment
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubmission(
            @PathVariable Long id) {

        submissionService.deleteSubmission(id);

        return ResponseEntity.ok(
                "Submission deleted successfully"
        );
    }
}