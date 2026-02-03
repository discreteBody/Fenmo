package com.fenmo.expenseTracker.service;

import com.fenmo.expenseTracker.entity.Expense;
import com.fenmo.expenseTracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository repository;

    public Expense saveExpense(Expense expense) {
        // Handle retries: if the client retries the same request, return existing [cite: 24]
        return repository.findByIdempotencyKey(expense.getIdempotencyKey())
                .orElseGet(() -> repository.save(expense));
    }

    public List<Expense> getAllExpenses(String category, String sort) {
        Sort sortOrder = "date_desc".equals(sort) ?
                Sort.by("date").descending() : Sort.by("date").ascending();

        if (category != null && !category.isEmpty()) {
            return repository.findByCategory(category, sortOrder); // [cite: 29, 30]
        }
        return repository.findAll(sortOrder);
    }
}