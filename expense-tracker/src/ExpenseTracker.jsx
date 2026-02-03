import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';

// Change this from '/expenses' to your actual Render URL
const API_BASE = 'https://fenmo-1.onrender.com/expenses';
const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [sort] = useState('date_desc'); // Requirement: newest first [cite: 11]

  // Wrapper for sonner toasts (maintains API compatibility)
  const showToast = (payload) => {
    const data = typeof payload === 'string' ? { message: payload } : payload || { message: '' };
    const type = data.type ?? 'success';
    const hasAction = !!data.actionLabel;

    if (hasAction) {
      toast[type](data.message, {
        action: {
          label: data.actionLabel,
          onClick: () => { data.onAction && data.onAction(); }
        },
        duration: data.ttl ?? 6000,
      });
    } else {
      toast[type](data.message, {
        duration: data.ttl ?? 3200,
      });
    }
  };

  // Stable, cancelable fetch that can be passed to children
  const fetchExpenses = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);

      const url = `${API_BASE}?${params.toString()}`;
      const response = await axios.get(url, { signal });
      setExpenses(response.data || []);
    } catch (err) {
      if (axios.isCancel?.(err) || err.name === 'CanceledError') {
        // request was cancelled — ignore
        return;
      }
      console.error('Error fetching expenses', err);
      setError('Could not load expenses — try again.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  // Effect: fetch on mount and when category/sort changes; abort when unmounted or deps change
  useEffect(() => {
    const ac = new AbortController();
    fetchExpenses(ac.signal);
    return () => ac.abort();
  }, [fetchExpenses]);

  // Memoize total so re-renders are cheap
  const total = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  return (
    <div className="app-shell" style={{ position: 'relative' }}>
      <div className="bg-accent" aria-hidden />
      <div className="header">
        <div className="header-title">
          <div className="brand-badge" aria-hidden>
            {/* simple SVG logo */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="4" fill="rgba(255,255,255,0.12)" />
              <path d="M7 12h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              <circle cx="17" cy="8" r="1.6" fill="white" opacity="0.9" />
            </svg>
          </div>
          <div>
            <h3 className="title-main">Fenmo — Expense Tracker</h3>
            <div className="title-sub">Keep track of spending — simple, reliable</div>
          </div>
        </div>
      </div>
      <ExpenseForm onExpenseAdded={() => { fetchExpenses(); showToast({ message: 'Expense added ✨', type: 'success' }); }} fetchExpenses={fetchExpenses} />

      <div style={{ marginTop: '20px', display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="filter-panel" style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <div style={{ color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Filter</div>

          <div className="filter-row">
            <div className="filter-chips" role="tablist" aria-label="Filter by category">
              {['','Food','Utilities','Entertainment','Transport','Health','Other'].map(cat => {
                const label = cat || 'All';
                const active = category === cat;
                return (
                  <button
                    key={label}
                    className={`filter-chip ${active ? 'active' : ''}`}
                    onClick={() => { setCategory(cat); fetchExpenses(); }}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {error && <div role="alert" style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}

      {loading ? <p>Loading expenses...</p> : <ExpenseTable expenses={expenses} onModified={async (signal) => { await fetchExpenses(signal); }} showToast={showToast} />}
    </div>
  );
};

export default ExpenseTracker;