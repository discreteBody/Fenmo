package com.fenmo.expenseTracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

@Data
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // [cite: 32]

    @NotNull
    @DecimalMin(value = "0.0", message = "Amount must be positive")
    private BigDecimal amount; // [cite: 33, 58]

    @NotBlank
    private String category; // [cite: 34]

    private String description; // [cite: 35]

    @NotNull
    private LocalDate date; // [cite: 36, 58]

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // [cite: 37]

    // This unique key ensures the API behaves correctly on retries [cite: 24, 25]
    @Column(unique = true)
    private String idempotencyKey;

    // Standard Getters/Setters or Lombok @Data
}