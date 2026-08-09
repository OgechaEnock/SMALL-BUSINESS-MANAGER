import { useEffect, useState } from "react";
import api from "../services/api";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    selling_price: "",
    cost_price: "",
    quantity: "",
    low_stock_threshold: 5,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products/");

      setProducts(response.data.products);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await api.post(
        "/products/",
        {
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          selling_price: Number(
            formData.selling_price
          ),
          cost_price: Number(
            formData.cost_price
          ),
          quantity: Number(
            formData.quantity
          ),
          low_stock_threshold: Number(
            formData.low_stock_threshold
          ),
        }
      );

      setProducts((previous) => [
        response.data.product,
        ...previous,
      ]);

      setFormData({
        name: "",
        description: "",
        sku: "",
        selling_price: "",
        cost_price: "",
        quantity: "",
        low_stock_threshold: 5,
      });

      setShowForm(false);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to create product"
      );
    }
  };

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  return (
    <div>
      <div>
        <h1>Inventory</h1>

        <button
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? "Cancel"
            : "Add Product"}
        </button>
      </div>

      {error && (
        <p>{error}</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h2>Add Product</h2>

          <div>
            <label>
              Product Name
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
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>
              SKU
            </label>

            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>
              Selling Price
            </label>

            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label>
              Cost Price
            </label>

            <input
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
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
              min="0"
              required
            />
          </div>

          <div>
            <label>
              Low Stock Threshold
            </label>

            <input
              type="number"
              name="low_stock_threshold"
              value={
                formData.low_stock_threshold
              }
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <button type="submit">
            Save Product
          </button>
        </form>
      )}

      <hr />

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Quantity</th>
              <th>Stock Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const lowStock =
                product.quantity <=
                product.low_stock_threshold;

              return (
                <tr key={product.id}>
                  <td>{product.name}</td>

                  <td>
                    {product.sku || "-"}
                  </td>

                  <td>
                    KES {product.selling_price}
                  </td>

                  <td>
                    KES {product.cost_price}
                  </td>

                  <td>{product.quantity}</td>

                  <td>
                    {lowStock
                      ? "Low Stock"
                      : "In Stock"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Inventory;