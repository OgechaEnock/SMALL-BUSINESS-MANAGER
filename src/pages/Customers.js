import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

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
    return <p>Loading customers...</p>;
  }

  return (
    <div>
      <h1>Customers</h1>

      {error && (
        <p>{error}</p>
      )}

      {success && (
        <p>{success}</p>
      )}

      <section>
        <h2>
          {editingId
            ? "Edit Customer"
            : "Add Customer"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
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

          <div>
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

          <div>
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

          <div>
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
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <hr />

      <section>
        <h2>Customer List</h2>

        <input
          type="search"
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
          <table>
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
                        onClick={() =>
                          handleEdit(
                            customer
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
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
        )}
      </section>
    </div>
  );
}

export default Customers;