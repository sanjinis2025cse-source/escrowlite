package com.escrowlite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.escrowlite.entity.Transaction;
import com.escrowlite.entity.TransactionStatus;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByEscrowReleaseId(
            Long escrowReleaseId
    );

    List<Transaction> findByStatus(
            TransactionStatus status
    );

    boolean existsByEscrowReleaseId(
            Long escrowReleaseId
    );
}