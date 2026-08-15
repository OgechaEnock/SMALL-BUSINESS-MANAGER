import { useEffect, useState } from "react";
import { Plus, X, Receipt, Pencil, Trash2, RefreshCw, Wallet } from "lucide-react";
import api from "../services/api";
import "./Expenses.css";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    description: "",
    category: "Other",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const categories = [
    "Rent",
    "Utilities",
    "Transport",
    "Salaries",
    "Supplies",
    "Marketing",
    "Internet",
    "Maintenance",
    "Taxes",
    "Other",
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/expenses/");

      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const resetForm = () => {
    setFormData({
      description: "",
      category: "Other",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      notes: "",
    });

    setEditingExpense(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        expense_date: formData.expense_date,
        notes: formData.notes,
      };

      if (editingExpense) {
        const response = await api.put(`/expenses/${editingExpense.id}`, payload);

        setExpenses((previous) =>
          previous.map((expense) =>
            expense.id === editingExpense.id ? response.data.expense : expense
          )
        );

        setError("");
      } else {
        const response = await api.post("/expenses/", payload);

        setExpenses((previous) => [response.data.expense, ...previous]);

        setError("");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);

    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
      notes: expense.notes || "",
    });

    setError("");
    setShowForm(true);
  };

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(`Delete expense "${expense.description}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/expenses/${expense.id}`);

      setExpenses((previous) =>
        previous.filter((item) => item.id !== expense.id)
      );
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to delete expense");
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  if (loading) {
    return (
      <div className="expenses-page">
        <div className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>Loading your expenses...</p>
          </div>
        </div>
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Track and manage your business expenses</p>
        </div>

        <button
          type="button"
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      <div className="expenses-summary">
        <div className="summary-icon">
          <Wallet size={20} />
        </div>
        <div>
          <span className="summary-label">Total Expenses</span>
          <span className="summary-amount">KES {totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <section className="expenses-section">
          <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>

          <form className="expenses-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Monthly internet"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expense_date">Expense Date</label>
              <input
                id="expense_date"
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingExpense ? "Update Expense" : "Save Expense"}
            </button>

            {editingExpense && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      )}

      <section className="expenses-section">
        <h2>Expense History</h2>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Receipt size={24} />
            </div>
            <h3>No expenses yet</h3>
            <p>Record your first expense to see it here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.expense_date}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>KES {Number(expense.amount).toFixed(2)}</td>
                    <td>{expense.notes || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(expense)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="button" className="btn btn-secondary" onClick={fetchExpenses}>
          <RefreshCw size={16} />
          Refresh Expenses
        </button>
      </section>
    </div>
  );
}

export default Expenses;