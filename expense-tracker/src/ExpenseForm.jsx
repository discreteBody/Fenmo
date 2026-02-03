import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const CATEGORIES = ['Food', 'Utilities', 'Entertainment', 'Transport', 'Health', 'Other'];

const empty = { amount: '', category: 'Food', description: '', date: '' };

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState(empty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Generate key once on mount; refresh only after successful submission [cite: 24]
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

  const handleSubmit = async (e) => {
    e.preventDefault();
    // optimistic UX: clear immediately so user can continue entering
    const previous = formData;
    setFormData(empty);
    setIsSubmitting(true);

    try {
      await axios.post('/expenses', { ...previous, idempotencyKey });
      setIdempotencyKey(uuidv4()); // prepare for next entry
      toast.success('Expense added ✨', { duration: 2000 });
      onExpenseAdded();
    } catch (error) {
      // rollback so user doesn't lose their input
      setFormData(previous);
      console.error(error);
      toast.error('Submission failed — try again', { duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" aria-label="Add expense form">
      <div className="form-row">
        <input
          className="input amount-input"
          inputMode="decimal"
          type="number"
          step="0.01"
          placeholder="Amount"
          required
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
        />
        <select
          className="input category-select"
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          className="input full"
          type="text"
          placeholder="Description"
          required
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />

        <input
          className="input"
          type="date"
          required
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add expense'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setFormData(empty)}>
          Reset
        </button>
      </div>
    </form>
  );
};

ExpenseForm.propTypes = { onExpenseAdded: PropTypes.func.isRequired };

export default ExpenseForm; 
