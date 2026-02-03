package com.fenmo.expenseTracker.controller;

import com.fenmo.expenseTracker.entity.Expense;
import com.fenmo.expenseTracker.repository.ExpenseRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Allow the Vite dev server (and localhost tools) to access the API during development.
// Restrict origins in production as needed.
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository repository;

    @PostMapping // [cite: 19]
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        // IDEMPOTENCY CHECK: If key exists, return existing instead of creating new
        return repository.findByIdempotencyKey(expense.getIdempotencyKey())
                .map(existing -> ResponseEntity.status(HttpStatus.OK).body(existing))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CREATED).body(repository.save(expense)));
    }

    @GetMapping // [cite: 26]
    public List<Expense> getExpenses(
            @RequestParam(required = false) String category, // [cite: 29]
            @RequestParam(defaultValue = "date_desc") String sort) { // [cite: 30]

        Sort sortOrder = sort.equals("date_desc") ?
                Sort.by("date").descending() : Sort.by("date").ascending();

        if (category != null && !category.isEmpty()) {
            return repository.findByCategory(category, sortOrder);
        }
        return repository.findAll(sortOrder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        return repository.findById(id)
                .map(e -> {
                    repository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense updated) {
        return repository.findById(id)
                .map(existing -> {
                    // Only allow updating a subset of fields
                    existing.setAmount(updated.getAmount());
                    existing.setCategory(updated.getCategory());
                    existing.setDescription(updated.getDescription());
                    existing.setDate(updated.getDate());
                    Expense saved = repository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
