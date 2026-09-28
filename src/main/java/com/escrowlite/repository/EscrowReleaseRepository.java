package com.escrowlite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.escrowlite.entity.EscrowRelease;
import com.escrowlite.entity.EscrowReleaseStatus;

public interface EscrowReleaseRepository
        extends JpaRepository<EscrowRelease, Long> {

    Optional<EscrowRelease> findByMilestoneId(Long milestoneId);

    List<EscrowRelease> findByStatus(EscrowReleaseStatus status);

    boolean existsByMilestoneId(Long milestoneId);
}