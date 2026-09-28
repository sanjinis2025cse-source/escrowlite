package com.escrowlite.entity;

import java.math.BigDecimal;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "escrow_releases")
public class EscrowRelease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Release amount is required")
    @Positive(message = "Release amount must be greater than zero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Release date is required")
    @Column(nullable = false)
    private LocalDateTime releasedAt;

    @NotNull(message = "Escrow release status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscrowReleaseStatus status;

    @OneToOne
    @JoinColumn(name = "milestone_id", nullable = false, unique = true)
    @JsonIgnoreProperties({
            "submissions"
    })
    private Milestone milestone;

    public EscrowRelease() {
    }

    public EscrowRelease(
            Long id,
            BigDecimal amount,
            LocalDateTime releasedAt,
            EscrowReleaseStatus status,
            Milestone milestone
    ) {
        this.id = id;
        this.amount = amount;
        this.releasedAt = releasedAt;
        this.status = status;
        this.milestone = milestone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getReleasedAt() {
        return releasedAt;
    }

    public void setReleasedAt(LocalDateTime releasedAt) {
        this.releasedAt = releasedAt;
    }

    public EscrowReleaseStatus getStatus() {
        return status;
    }

    public void setStatus(EscrowReleaseStatus status) {
        this.status = status;
    }

    public Milestone getMilestone() {
        return milestone;
    }

    public void setMilestone(Milestone milestone) {
        this.milestone = milestone;
    }
}