package com.escrowlite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.escrowlite.entity.Project;
import com.escrowlite.entity.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByClientId(Long clientId);

    List<Project> findByFreelancerId(Long freelancerId);

    List<Project> findByStatus(ProjectStatus status);
}