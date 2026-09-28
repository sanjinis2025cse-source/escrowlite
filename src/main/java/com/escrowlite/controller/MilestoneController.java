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

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.MilestoneStatus;
import com.escrowlite.service.MilestoneService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(
            MilestoneService milestoneService) {

        this.milestoneService = milestoneService;
    }

    @PostMapping
    public ResponseEntity<Milestone> createMilestone(
            @Valid @RequestBody Milestone milestone) {

        Milestone createdMilestone =
                milestoneService.createMilestone(milestone);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdMilestone);
    }

    @GetMapping
    public ResponseEntity<List<Milestone>> getAllMilestones() {

        return ResponseEntity.ok(
                milestoneService.getAllMilestones()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Milestone> getMilestoneById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                milestoneService.getMilestoneById(id)
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Milestone>> getMilestonesByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                milestoneService.getMilestonesByProject(
                        projectId
                )
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Milestone> updateMilestoneStatus(
            @PathVariable Long id,
            @RequestParam MilestoneStatus status) {

        return ResponseEntity.ok(
                milestoneService.updateMilestoneStatus(
                        id,
                        status
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMilestone(
            @PathVariable Long id) {

        milestoneService.deleteMilestone(id);

        return ResponseEntity.ok(
                "Milestone deleted successfully"
        );
    }
}