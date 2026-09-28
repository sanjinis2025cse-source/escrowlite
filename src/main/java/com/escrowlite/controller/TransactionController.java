package com.escrowlite.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.escrowlite.entity.Transaction;
import com.escrowlite.entity.TransactionStatus;
import com.escrowlite.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {

        this.transactionService = transactionService;
    }

    @PostMapping("/escrow/{escrowReleaseId}")
    public ResponseEntity<Transaction> createTransaction(
            @PathVariable Long escrowReleaseId) {

        Transaction transaction =
                transactionService.createTransaction(
                        escrowReleaseId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {

        return ResponseEntity.ok(
                transactionService.getAllTransactions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                transactionService.getTransactionById(id)
        );
    }

    @GetMapping("/escrow/{escrowReleaseId}")
    public ResponseEntity<Transaction>
    getTransactionByEscrowRelease(
            @PathVariable Long escrowReleaseId) {

        return ResponseEntity.ok(
                transactionService
                        .getTransactionByEscrowRelease(
                                escrowReleaseId
                        )
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Transaction>
    updateTransactionStatus(
            @PathVariable Long id,
            @RequestParam TransactionStatus status) {

        return ResponseEntity.ok(
                transactionService
                        .updateTransactionStatus(
                                id,
                                status
                        )
        );
    }
}