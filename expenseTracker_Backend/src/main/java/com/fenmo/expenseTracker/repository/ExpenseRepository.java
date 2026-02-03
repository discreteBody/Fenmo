package com.fenmo.expenseTracker.repository;

import com.fenmo.expenseTracker.entity.Expense;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Optional<Expense> findByIdempotencyKey(String idempotencyKey);
    List<Expense> findByCategory(String category, Sort sort); // [cite: 29, 30]
}
