import { useEffect, useState } from "react";
import api from "../services/api";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/customers/"
      );

      setCustomers(
        response.data.customers
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId) {
        const response = await api.put(
          `/customers/${editingId}`,
          formData
        );

        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id === editingId
              ? response.data.customer
              : customer
          )
        );

        setSuccess(
          "Customer updated successfully"
        );
      } else {
        const response = await api.post(
          "/customers/",
          formData
        );

        setCustomers((previous) => [
          response.data.customer,
          ...previous,
        ]);

        setSuccess(
          "Customer created successfully"
        );
      }

      resetForm();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to save customer"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleDelete = async (customerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/customers/${customerId}`
      );

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer.id !== customerId
        )
      );

      setSuccess(
        "Customer deleted successfully"
      );

      if (editingId === customerId) {
        resetForm();
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to delete customer"
      );
    }
  };

  const filteredCustomers =
    customers.filter((customer) => {
      const searchTerm =
        search.toLowerCase();

      return (
        customer.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchTerm) ||
        customer.email
          ?.toLowerCase()
          .includes(searchTerm)
      );
    });

  if (loading) {
    return (
      <div className="customers-loading">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage your customer contacts
          </p>
        </div>

        <button
          type="button"
          className={
            showForm
              ? "btn-secondary"
              : "btn-primary"
          }
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm
            ? "Cancel"
            : "Add Customer"}
        </button>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert-success">
          {success}
        </div>
      )}

      {showForm && (
        <section className="customers-section">
          <h2>
            {editingId
              ? "Edit Customer"
              : "Add Customer"}
          </h2>

          <form
            className="customers-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Customer"
                : "Add Customer"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </section>
      )}

      <section className="customers-section">
        <h2>Customer List</h2>

        <input
          type="search"
          className="search-input"
          placeholder="Search customers..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        {filteredCustomers.length ===
        0 ? (
          <p>
            {search
              ? "No customers match your search."
              : "No customers found."}
          </p>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr key={customer.id}>
                      <td>
                        {customer.name}
                      </td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {customer.email || "-"}
                      </td>

                      <td>
                        {customer.address || "-"}
                      </td>

                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            handleEdit(
                              customer
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() =>
                            handleDelete(
                              customer.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Customers;