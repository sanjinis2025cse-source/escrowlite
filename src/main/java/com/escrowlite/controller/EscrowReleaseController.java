package com.escrowlite.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.escrowlite.entity.EscrowRelease;
import com.escrowlite.service.EscrowReleaseService;

@RestController
@RequestMapping("/api/escrow")
public class EscrowReleaseController {

    private final EscrowReleaseService escrowReleaseService;

    public EscrowReleaseController(
            EscrowReleaseService escrowReleaseService) {

        this.escrowReleaseService = escrowReleaseService;
    }

    @PostMapping("/release/{milestoneId}")
    public ResponseEntity<EscrowRelease> releaseEscrow(
            @PathVariable Long milestoneId) {

        EscrowRelease release =
                escrowReleaseService.releaseEscrow(
                        milestoneId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(release);
    }

    @GetMapping
    public ResponseEntity<List<EscrowRelease>> getAllReleases() {

        return ResponseEntity.ok(
                escrowReleaseService.getAllReleases()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EscrowRelease> getReleaseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                escrowReleaseService.getReleaseById(id)
        );
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<EscrowRelease>
    getReleaseByMilestone(
            @PathVariable Long milestoneId) {

        return ResponseEntity.ok(
                escrowReleaseService
                        .getReleaseByMilestone(milestoneId)
        );
    }
}