import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

const styles = {
  table: {
    width: '100%',
    marginTop: 20,
    borderCollapse: 'collapse',
    fontFamily: 'Segoe UI, Roboto, system-ui, -apple-system, "Helvetica Neue", Arial',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '2px solid #e6e6e6',
    color: '#333',
    fontSize: 13,
    background: '#fafafa'
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: 14,
    color: '#222'
  },
  rowAlt: { background: '#fbfbfb' },
  muted: { color: '#666', fontSize: 13 },
  totalCell: { fontWeight: 700, padding: '10px 12px', borderTop: '2px solid #e6e6e6' }
};

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const dateFormatter = (isoDate) => {
  if (!isoDate) return '';
  // Accepts YYYY-MM-DD (from backend) or full ISO
  const d = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString();
};

const ExpenseTable = ({ expenses = [], onModified = () => {}, showToast = () => {} }) => {
  const [visible, setVisible] = React.useState(expenses);
  const [editingId, setEditingId] = React.useState(null);
  const [editingData, setEditingData] = React.useState({});
  const [savingId, setSavingId] = React.useState(null);
  const [rowErrors, setRowErrors] = React.useState({});
  // pendingRef holds deletions that can still be undone: id -> { item, timer }
  const pendingRef = React.useRef(new Map());

  React.useEffect(() => setVisible(expenses), [expenses]);

  const total = useMemo(() => {
    return visible.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  }, [visible]);

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setEditingData({ amount: String(exp.amount || ''), description: exp.description || '', category: exp.category || '', date: exp.date || '' });
  };

  const cancelEdit = () => { setEditingId(null); setEditingData({}); };

  const saveEdit = async (id) => {
    // clear previous error for this row
    setRowErrors(r => ({ ...r, [id]: null }));

    // simple client validation
    if (!editingData.amount || Number(editingData.amount) <= 0) {
      setRowErrors(r => ({ ...r, [id]: 'Enter a valid amount' }));
      return;
    }
    if (!editingData.date) {
      setRowErrors(r => ({ ...r, [id]: 'Please set a date' }));
      return;
    }

    const payload = {
      amount: Number(editingData.amount),
      description: editingData.description,
      category: editingData.category,
      date: editingData.date
    };

    setSavingId(id);
        try {
            const axios = (await import('axios')).default;
            
            // Requirement: Use the full Render URL for the live environment 
            const API_URL = `https://fenmo-1.onrender.com/expenses/${id}`;
            
            const res = await axios.put(API_URL, payload);

            // Update visible row from server response if provided [cite: 27]
            if (res?.data) {
                setVisible(v => v.map(x => x.id === id ? res.data : x));
            } else {
                setVisible(v => v.map(x => x.id === id ? { ...x, ...payload } : x));
            }

            // Close editor only after server success to avoid layout jumps [cite: 13, 61]
            setEditingId(null);
            await onModified(); // Triggers list refresh [cite: 9]
            toast.success('Saved ✓', { duration: 2000 });
            } catch (err) {
            console.error('update failed', err);
            // Requirement: Handle failed API responses [cite: 54, 61]
            const msg = err?.response?.data?.message || 'Update failed — try again';
            setRowErrors(r => ({ ...r, [id]: msg }));
            toast.error(msg, { duration: 3200 });
            } finally {
            setSavingId(null); // Clear loading state [cite: 61]
        }
  };

const deleteExpense = (id) => {
  const item = visible.find(x => x.id === id);
  if (!item) return;

  if (!confirm('Delete this expense?')) return;

  // 1. Point to your LIVE Render URL
  const API_DELETE_URL = `https://fenmo-1.onrender.com/expenses/${id}`;

  // Optimistic UI update
  setVisible(v => v.filter(x => x.id !== id));

  const timer = setTimeout(async () => {
    try {
      // Use the absolute URL for the live environment
      await (await import('axios')).default.delete(API_DELETE_URL);
      pendingRef.current.delete(id);
      onModified(); 
    } catch (err) {
      console.error('delete failed', err);
      // Restore item if server fails (Production quality requirement) [cite: 13, 61]
      setVisible(v => [item, ...v]);
      pendingRef.current.delete(id);
      toast.error('Delete failed', { duration: 4000 });
    }
  }, 5000); // 5s undo window

  pendingRef.current.set(id, { item, timer });

  toast.success('Expense deleted 🗑️', {
    action: {
      label: 'Undo',
      onClick: () => {
        const entry = pendingRef.current.get(id);
        if (!entry) return;
        clearTimeout(entry.timer);
        pendingRef.current.delete(id);
        setVisible(v => [entry.item, ...v]);
        toast.success('Restored ↩️', { duration: 2600 });
      }
    },
    duration: 5000
  });
};

  return (
    <div className="table-wrap card" style={{ padding: 0 }}>
      <table className="expenses-table" aria-label="Expenses table">
        <colgroup>
          <col className="col-date" />
          <col className="col-desc" />
          <col className="col-category" />
          <col className="col-amount" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ width: 100, textAlign: 'center' }} aria-hidden>Actions</th>
          </tr>
        </thead>

        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>
                <div className="" style={{ color: 'var(--muted)' }}>No expenses yet — add one to get started.</div>
              </td>
            </tr>
          ) : (
            visible.map((exp, idx) => {
              const isEditing = editingId === exp.id;
              const isRemoving = pendingRef.current.has(exp.id);
              const pillClass = `pill-${((exp.category || 'other').toString().toLowerCase().replace(/\s+/g, '-'))}`;

              return (
                <tr key={exp.id ?? exp.idempotencyKey ?? idx} className={isRemoving ? 'row-anim-exit' : undefined}>
                  <td>
                    {isEditing ? (
                      <input className="input" type="date" value={editingData.date} onChange={e => setEditingData(d => ({ ...d, date: e.target.value }))} />
                    ) : (
                      dateFormatter(exp.date)
                    )}
                  </td>

                  <td style={{ maxWidth: 360 }}>
                    {isEditing ? (
                      <input className="input" value={editingData.description} onChange={e => setEditingData(d => ({ ...d, description: e.target.value }))} />
                    ) : (
                      exp.description || <span style={styles.muted}>—</span>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input className="input" value={editingData.category} onChange={e => setEditingData(d => ({ ...d, category: e.target.value }))} />
                    ) : (
                      <span className={`category-pill ${pillClass}`}>{exp.category || 'Uncategorized'}</span>
                    )}
                  </td>

                  <td className="amount">
                    {isEditing ? (
                      <input className="input" type="number" step="0.01" value={editingData.amount} onChange={e => setEditingData(d => ({ ...d, amount: e.target.value }))} />
                    ) : (
                      currencyFormatter.format(Number(exp.amount) || 0)
                    )}
                  </td>

                  <td className="actions" style={{ textAlign: 'right' }}>
                    {isEditing ? (
                      <>
                        <button className="action-btn action-edit" onClick={() => saveEdit(exp.id)} aria-label="Save" disabled={savingId === exp.id}>
                          {savingId === exp.id ? (
                            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden><path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ) : (
                            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden><path d="M4 21h4l11-11a2 2 0 0 0-4-4L4 17v4zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.8 1.8 4 4 1.8-1.8z"/></svg>
                          )}
                          <span className="label">{savingId === exp.id ? 'Saving…' : 'Save'}</span>
                        </button>
                        <button className="action-btn" onClick={cancelEdit} disabled={savingId === exp.id}>
                          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.5-9.5l1 8h1l1-8h-3zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          <span className="label">Cancel</span>
                        </button>

                        {rowErrors[exp.id] && (
                          <div style={{ color: 'salmon', marginTop: 8, gridColumn: '1 / -1' }}>{String(rowErrors[exp.id])}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <button className="action-btn action-edit" aria-label={`Edit expense ${exp.description || ''}`} onClick={() => startEdit(exp)}>
                          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
                          <span className="label">Edit</span>
                        </button>

                        <button className="action-btn action-delete" aria-label={`Delete expense ${exp.description || ''}`} onClick={() => deleteExpense(exp.id)}>
                          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.5-9.5l1 8h1l1-8h-3zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                          <span className="label">Delete</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

        {visible.length > 0 && (
          <tfoot>
            <tr className="total-row">
              <td colSpan={3} style={{ paddingLeft: 12 , textAlign:'center', justifyContent:'center', paddingBottom: 15}}>Total</td>
              <td className="amount" style={{ paddingLeft: 12 , textAlign:'center', justifyContent:'center', paddingBottom: 15}}>{currencyFormatter.format(total)}</td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

ExpenseTable.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.string,
    idempotencyKey: PropTypes.string
  })),
  onModified: PropTypes.func,
  showToast: PropTypes.func
};

export default React.memo(ExpenseTable);
