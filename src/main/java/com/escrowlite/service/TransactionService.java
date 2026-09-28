package com.escrowlite.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.escrowlite.entity.EscrowRelease;
import com.escrowlite.entity.EscrowReleaseStatus;
import com.escrowlite.entity.Transaction;
import com.escrowlite.entity.TransactionStatus;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.EscrowReleaseRepository;
import com.escrowlite.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final EscrowReleaseRepository escrowReleaseRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            EscrowReleaseRepository escrowReleaseRepository) {

        this.transactionRepository = transactionRepository;
        this.escrowReleaseRepository = escrowReleaseRepository;
    }

    public Transaction createTransaction(Long escrowReleaseId) {

        EscrowRelease escrowRelease =
                escrowReleaseRepository.findById(escrowReleaseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Escrow release not found with id: "
                                                + escrowReleaseId
                                )
                        );

        if (escrowRelease.getStatus()
                != EscrowReleaseStatus.RELEASED) {

            throw new BadRequestException(
                    "Transaction can only be created for a released escrow"
            );
        }

        if (transactionRepository
                .existsByEscrowReleaseId(escrowReleaseId)) {

            throw new BadRequestException(
                    "Transaction already exists for this escrow release"
            );
        }

        Transaction transaction =
                new Transaction();

        transaction.setAmount(
                escrowRelease.getAmount()
        );

        transaction.setTransactionDate(
                LocalDateTime.now()
        );

        transaction.setStatus(
                TransactionStatus.COMPLETED
        );

        transaction.setEscrowRelease(
                escrowRelease
        );

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {

        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(Long id) {

        return transactionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction not found with id: "
                                        + id
                        )
                );
    }

    public Transaction getTransactionByEscrowRelease(
            Long escrowReleaseId) {

        if (!escrowReleaseRepository
                .existsById(escrowReleaseId)) {

            throw new ResourceNotFoundException(
                    "Escrow release not found with id: "
                            + escrowReleaseId
            );
        }

        return transactionRepository
                .findByEscrowReleaseId(escrowReleaseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction not found for escrow release id: "
                                        + escrowReleaseId
                        )
                );
    }

    public Transaction updateTransactionStatus(
            Long id,
            TransactionStatus status) {

        Transaction transaction =
                getTransactionById(id);

        if (status == null) {

            throw new BadRequestException(
                    "Transaction status is required"
            );
        }

        transaction.setStatus(status);

        return transactionRepository.save(transaction);
    }
}