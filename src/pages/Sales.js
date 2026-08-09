import { useEffect, useState } from "react";
import api from "../services/api";

function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, salesResponse] =
        await Promise.all([
          api.get("/products/"),
          api.get("/sales/"),
        ]);

      setProducts(
        productsResponse.data.products
      );

      setSales(
        salesResponse.data.sales
      );
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

  const selectedProduct = products.find(
    (product) =>
      product.id ===
      Number(formData.product_id)
  );

  const quantity = Number(
    formData.quantity
  );

  const total = selectedProduct
    ? selectedProduct.selling_price *
      quantity
    : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.product_id) {
      setError("Please select a product");
      return;
    }

    if (quantity <= 0) {
      setError(
        "Quantity must be greater than zero"
      );
      return;
    }

    if (
      selectedProduct &&
      quantity > selectedProduct.quantity
    ) {
      setError(
        `Only ${selectedProduct.quantity} units are available`
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/sales/",
        {
          product_id: Number(
            formData.product_id
          ),
          quantity: quantity,
        }
      );

      const newSale =
        response.data.sale;

      setSales((previous) => [
        newSale,
        ...previous,
      ]);

      setProducts((previous) =>
        previous.map((product) =>
          product.id ===
          newSale.product_id
            ? {
                ...product,
                quantity:
                  newSale.remaining_stock,
              }
            : product
        )
      );

      setFormData({
        product_id: "",
        quantity: 1,
      });

      setSuccess(
        "Sale recorded successfully"
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to record sale"
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                Select a product
              </option>

              {products.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={
                      product.quantity === 0
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
                    available)
                  </option>
                )
              )}
            </select>
          </div>

          {selectedProduct && (
            <div>
              <p>
                Available stock:{" "}
                {selectedProduct.quantity}
              </p>

              <p>
                Selling price: KES{" "}
                {
                  selectedProduct.selling_price
                }
              </p>
            </div>
          )}

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
            <h3>
              Total: KES{" "}
              {total.toFixed(2)}
            </h3>
          </div>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Recording..."
              : "Record Sale"}
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
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    {sale.product_name}
                  </td>

                  <td>
                    {sale.quantity}
                  </td>

                  <td>
                    KES{" "}
                    {sale.unit_price.toFixed(
                      2
                    )}
                  </td>

                  <td>
                    KES{" "}
                    {sale.total_amount.toFixed(
                      2
                    )}
                  </td>

                  <td>
                    {new Date(
                      sale.created_at
                    ).toLocaleString()}
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
