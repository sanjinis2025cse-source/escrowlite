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
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Transaction amount is required")
    @Positive(message = "Transaction amount must be greater than zero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Transaction date is required")
    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @NotNull(message = "Transaction status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @OneToOne
    @JoinColumn(
            name = "escrow_release_id",
            nullable = false,
            unique = true
    )
    @JsonIgnoreProperties({
            "milestone"
    })
    private EscrowRelease escrowRelease;

    public Transaction() {
    }

    public Transaction(
            Long id,
            BigDecimal amount,
            LocalDateTime transactionDate,
            TransactionStatus status,
            EscrowRelease escrowRelease
    ) {
        this.id = id;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.status = status;
        this.escrowRelease = escrowRelease;
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

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public EscrowRelease getEscrowRelease() {
        return escrowRelease;
    }

    public void setEscrowRelease(EscrowRelease escrowRelease) {
        this.escrowRelease = escrowRelease;
    }
}