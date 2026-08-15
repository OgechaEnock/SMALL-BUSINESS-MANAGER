import { useEffect, useState } from "react";
import { Plus, X, Package, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import "./Inventory.css";

function Inventory() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
      setError(error.response?.data?.error || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      selling_price: "",
      cost_price: "",
      quantity: "",
      low_stock_threshold: 5,
    });

    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        selling_price: Number(formData.selling_price),
        cost_price: Number(formData.cost_price),
        quantity: Number(formData.quantity),
        low_stock_threshold: Number(formData.low_stock_threshold),
      };

      if (editingProduct) {
        const response = await api.put(`/products/${editingProduct.id}`, productData);

        setProducts((previous) =>
          previous.map((product) =>
            product.id === editingProduct.id ? response.data.product : product
          )
        );
      } else {
        const response = await api.post("/products/", productData);

        setProducts((previous) => [response.data.product, ...previous]);
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      sku: product.sku || "",
      selling_price: product.selling_price ?? "",
      cost_price: product.cost_price ?? "",
      quantity: product.quantity ?? "",
      low_stock_threshold: product.low_stock_threshold ?? 5,
    });

    setShowForm(true);
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/products/${product.id}`);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="page-header">
          <div>
            <h1>Inventory</h1>
            <p>Loading your inventory...</p>
          </div>
        </div>
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage your products and stock levels</p>
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
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <section className="inventory-section">
          <form className="inventory-form" onSubmit={handleSubmit}>
            <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Selling Price</label>
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

            <div className="form-group">
              <label>Cost Price</label>
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

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input
                type="number"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {editingProduct ? "Update Product" : "Save Product"}
            </button>

            {editingProduct && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      )}

      <section className="inventory-section">
        <h2>Product List</h2>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={24} />
            </div>
            <h3>No products yet</h3>
            <p>Add your first product to start managing inventory.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Selling Price</th>
                  <th>Cost Price</th>
                  <th>Quantity</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const lowStock = product.quantity <= product.low_stock_threshold;

                  return (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku || "-"}</td>
                      <td>KES {product.selling_price}</td>
                      <td>KES {product.cost_price}</td>
                      <td>{product.quantity}</td>
                      <td>
                        {lowStock ? (
                          <span className="badge badge-warning">
                            <AlertTriangle size={12} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Inventory;