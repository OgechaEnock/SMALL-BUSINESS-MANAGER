import { useEffect, useState } from "react";
import api from "../services/api";
import "./Sales.css";

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    customer_id: "",
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        salesResponse,
        productsResponse,
        customersResponse,
      ] = await Promise.all([
        api.get("/sales/"),
        api.get("/products/"),
        api.get("/customers/"),
      ]);

      setSales(salesResponse.data.sales);
      setProducts(productsResponse.data.products);
      setCustomers(customersResponse.data.customers);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to load sales data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      product_id: "",
      customer_id: "",
      quantity: 1,
    });

    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await api.post(
        "/sales/",
        {
          product_id: Number(
            formData.product_id
          ),
          customer_id:
            formData.customer_id
              ? Number(
                  formData.customer_id
                )
              : null,
          quantity: Number(
            formData.quantity
          ),
        }
      );

      setSales((previous) => [
        response.data.sale,
        ...previous,
      ]);

      resetForm();

      setSuccess(
        "Sale created successfully"
      );

      // Refresh products so stock
      // reflects the sale.
      const productsResponse =
        await api.get("/products/");

      setProducts(
        productsResponse.data.products
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to create sale"
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(
    (product) =>
      product.id ===
      Number(formData.product_id)
  );

  const totalAmount = selectedProduct
    ? Number(
        selectedProduct.selling_price
      ) *
      Number(formData.quantity || 0)
    : 0;

  if (loading) {
    return (
      <div className="sales-loading">
        Loading sales...
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales</h1>
          <p>
            Record and track your sales
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
            : "Record Sale"}
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
        <section className="sales-section">
          <h2>Record Sale</h2>

          <form
            className="sales-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>
                Product
              </label>

              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={
                        product.quantity <= 0
                      }
                    >
                      {product.name} -
                      {" "}
                      KES{" "}
                      {
                        product.selling_price
                      }
                      {" "}
                      (
                      {product.quantity}
                      {" "}
                      in stock)
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Customer
              </label>

              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Quantity
              </label>

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={
                  selectedProduct
                    ? selectedProduct.quantity
                    : undefined
                }
                required
              />
            </div>

            <div className="form-total">
              <strong>
                Total: KES{" "}
                {totalAmount.toFixed(2)}
              </strong>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={
                saving ||
                !formData.product_id
              }
            >
              {saving
                ? "Processing..."
                : "Complete Sale"}
            </button>
          </form>
        </section>
      )}

      <section className="sales-section">
        <h2>Sales History</h2>

        {sales.length === 0 ? (
          <p>
            No sales recorded yet.
          </p>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      {new Date(
                        sale.created_at
                      ).toLocaleString()}
                    </td>

                    <td>
                      {sale.product_name}
                    </td>

                    <td>
                      {sale.customer_name ||
                        "Walk-in Customer"}
                    </td>

                    <td>
                      {sale.quantity}
                    </td>

                    <td>
                      KES{" "}
                      {Number(
                        sale.unit_price
                      ).toFixed(2)}
                    </td>

                    <td>
                      KES{" "}
                      {Number(
                        sale.total_amount
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Sales;