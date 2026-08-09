import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/"
      );

      setDashboard(
        response.data.dashboard
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <div>
          <h3>Today's Revenue</h3>
          <p>
            KES{" "}
            {dashboard.today_revenue.toFixed(
              2
            )}
          </p>
        </div>

        <div>
          <h3>Today's Transactions</h3>
          <p>
            {dashboard.today_transactions}
          </p>
        </div>

        <div>
          <h3>Total Products</h3>
          <p>
            {dashboard.total_products}
          </p>
        </div>

        <div>
          <h3>Low Stock</h3>
          <p>
            {dashboard.low_stock_products}
          </p>
        </div>
      </div>

      <hr />

      <div>
        <h2>Inventory Overview</h2>

        <p>
          Total units in stock:{" "}
          <strong>
            {dashboard.total_inventory}
          </strong>
        </p>

        <p>
          Total revenue:{" "}
          <strong>
            KES{" "}
            {dashboard.total_revenue.toFixed(
              2
            )}
          </strong>
        </p>
      </div>

      <hr />

      <div>
        <h2>Recent Sales</h2>

        {dashboard.recent_sales.length ===
        0 ? (
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
              {dashboard.recent_sales.map(
                (sale) => (
                  <tr key={sale.id}>
                    <td>
                      {sale.product_name}
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

                    <td>
                      {new Date(
                        sale.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;