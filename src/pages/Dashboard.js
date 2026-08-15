import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Banknote,
  Receipt,
  Package,
  AlertTriangle,
  Users,
  RefreshCw,
  TrendingUp,
  Boxes,
  ShoppingCart,
  Inbox,
} from "lucide-react";

import api from "../services/api";
import "./Dashboard.css";

const formatKES = (value) =>
  `KES ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/dashboard/");
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (selectedDays) => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get(`/dashboard/analytics?days=${selectedDays}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to load sales analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const handleRefresh = () => {
    fetchDashboard();
    fetchAnalytics(days);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Loading your business overview...</p>
          </div>
        </div>
        <div className="dashboard-cards">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="dashboard-card">
              <div className="skeleton" style={{ height: 16, width: "60%" }} />
              <div className="skeleton" style={{ height: 28, width: "80%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return <div className="error-state">{error}</div>;
  }

  if (!dashboard) {
    return <div className="error-state">No dashboard data available.</div>;
  }

  const kpiCards = [
    {
      label: "Today's Revenue",
      value: formatKES(dashboard.today_revenue || 0),
      icon: Banknote,
      accent: "success",
    },
    {
      label: "Today's Transactions",
      value: dashboard.today_transactions || 0,
      icon: Receipt,
      accent: "primary",
    },
    {
      label: "Total Products",
      value: dashboard.total_products || 0,
      icon: Package,
      accent: "info",
    },
    {
      label: "Low Stock",
      value: dashboard.low_stock_products || 0,
      icon: AlertTriangle,
      accent: "warning",
      warning: dashboard.low_stock_products > 0,
    },
    {
      label: "Total Customers",
      value: dashboard.total_customers || 0,
      icon: Users,
      accent: "primary",
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your business performance</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="dashboard-cards">
        {kpiCards.map(({ label, value, icon: Icon, accent, warning }) => (
          <div
            key={label}
            className={`dashboard-card ${warning ? "warning" : ""}`}
          >
            <div className={`kpi-icon kpi-${accent}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3>{label}</h3>
              <p>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="analytics-header">
          <div>
            <h2>Sales Analytics</h2>
            {analytics && (
              <p>
                {days}-day revenue: <strong>{formatKES(analytics.total_revenue || 0)}</strong>
              </p>
            )}
          </div>

          <div className="period-selector">
            {[7, 30].map((period) => (
              <button
                key={period}
                type="button"
                className={`period-button ${days === period ? "active" : ""}`}
                onClick={() => setDays(period)}
              >
                {period} Days
              </button>
            ))}
          </div>
        </div>

        {analyticsLoading ? (
          <div className="chart-container">
            <div className="skeleton" style={{ height: 300 }} />
          </div>
        ) : analytics ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={analytics.daily || []}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatKES(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <TrendingUp size={24} />
            </div>
            <h3>No analytics data</h3>
            <p>Record some sales to see your revenue trends.</p>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Best-Selling Products</h2>
        {!analytics?.best_selling_products?.length ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ShoppingCart size={24} />
            </div>
            <h3>No product sales</h3>
            <p>No product sales recorded during this period.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.best_selling_products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity_sold}</td>
                    <td>{formatKES(product.revenue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Low-Stock Products</h2>
        {!analytics?.low_stock_products?.length ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Boxes size={24} />
            </div>
            <h3>All stocked up</h3>
            <p>All products are sufficiently stocked.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.threshold}</td>
                    <td>
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} />
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Inventory Overview</h2>
        <div className="inventory-overview">
          <div className="inventory-item">
            <span>Total units in stock</span>
            <strong>{dashboard.total_inventory || 0}</strong>
          </div>
          <div className="inventory-item">
            <span>Total revenue</span>
            <strong>{formatKES(dashboard.total_revenue || 0)}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Sales</h2>
        {!dashboard.recent_sales?.length ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Inbox size={24} />
            </div>
            <h3>No sales yet</h3>
            <p>Record your first sale to see it here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.product_name}</td>
                    <td>{sale.customer_name || "Walk-in Customer"}</td>
                    <td>{sale.quantity}</td>
                    <td>{formatKES(sale.unit_price || 0)}</td>
                    <td>{formatKES(sale.total_amount || 0)}</td>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;