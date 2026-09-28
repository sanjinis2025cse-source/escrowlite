package com.escrowlite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.escrowlite.entity.Milestone;
import com.escrowlite.entity.MilestoneStatus;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectId(Long projectId);

    List<Milestone> findByStatus(MilestoneStatus status);
}