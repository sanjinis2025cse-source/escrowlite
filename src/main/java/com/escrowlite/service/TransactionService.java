package com.escrowlite.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.escrowlite.entity.EscrowRelease;
import com.escrowlite.entity.EscrowReleaseStatus;
import com.escrowlite.entity.Transaction;
import com.escrowlite.entity.TransactionStatus;
import com.escrowlite.entity.User;
import com.escrowlite.entity.UserRole;
import com.escrowlite.exception.BadRequestException;
import com.escrowlite.exception.ResourceNotFoundException;
import com.escrowlite.repository.EscrowReleaseRepository;
import com.escrowlite.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final EscrowReleaseRepository escrowReleaseRepository;
    private final CurrentUserService currentUserService;

    public TransactionService(TransactionRepository transactionRepository,
                              EscrowReleaseRepository escrowReleaseRepository,
                              CurrentUserService currentUserService) {
        this.transactionRepository = transactionRepository;
        this.escrowReleaseRepository = escrowReleaseRepository;
        this.currentUserService = currentUserService;
    }

    public Transaction createTransaction(Long escrowReleaseId) {
        currentUserService.requireRole(UserRole.CLIENT);
        EscrowRelease release = findRelease(escrowReleaseId);
        currentUserService.requireClientOwner(release.getMilestone().getProject());
        if (release.getStatus() != EscrowReleaseStatus.RELEASED) {
            throw new BadRequestException("Transaction can only be created for a released escrow");
        }
        if (transactionRepository.existsByEscrowReleaseId(escrowReleaseId)) {
            throw new BadRequestException("Transaction already exists for this escrow release");
        }
        Transaction transaction = new Transaction();
        transaction.setAmount(release.getAmount());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setEscrowRelease(release);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        User user = currentUserService.getCurrentUser();
        return transactionRepository.findAll().stream()
                .filter(transaction -> currentUserService.isParticipant(user,
                        transaction.getEscrowRelease().getMilestone().getProject()))
                .toList();
    }

    public Transaction getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Transaction not found with id: " + id));
        currentUserService.requireProjectParticipant(transaction.getEscrowRelease().getMilestone().getProject());
        return transaction;
    }

    public Transaction getTransactionByEscrowRelease(Long escrowReleaseId) {
        EscrowRelease release = findRelease(escrowReleaseId);
        currentUserService.requireProjectParticipant(release.getMilestone().getProject());
        return transactionRepository.findByEscrowReleaseId(escrowReleaseId).orElseThrow(() ->
                new ResourceNotFoundException("Transaction not found for escrow release id: " + escrowReleaseId));
    }

    public Transaction updateTransactionStatus(Long id, TransactionStatus status) {
        Transaction transaction = getTransactionById(id);
        currentUserService.requireClientOwner(transaction.getEscrowRelease().getMilestone().getProject());
        if (status == null) throw new BadRequestException("Transaction status is required");
        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    private EscrowRelease findRelease(Long id) {
        return escrowReleaseRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Escrow release not found with id: " + id));
    }
}
