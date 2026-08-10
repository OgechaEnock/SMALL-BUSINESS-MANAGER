import { useEffect, useState } from "react";
import api from "../services/api";

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setFormData({
        product_id: "",
        customer_id: "",
        quantity: 1,
      });

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
    return <p>Loading sales...</p>;
  }

  return (
    <div>
      <h1>Sales</h1>

      {error && (
        <p>{error}</p>
      )}

      {success && (
        <p>{success}</p>
      )}

      <section>
        <h2>Record Sale</h2>

        <form onSubmit={handleSubmit}>
          <div>
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

          <div>
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

          <div>
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

          <div>
            <strong>
              Total: KES{" "}
              {totalAmount.toFixed(2)}
            </strong>
          </div>

          <button
            type="submit"
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

      <hr />

      <section>
        <h2>Sales History</h2>

        {sales.length === 0 ? (
          <p>
            No sales recorded yet.
          </p>
        ) : (
          <table>
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
        )}
      </section>
    </div>
  );
}

export default Sales;