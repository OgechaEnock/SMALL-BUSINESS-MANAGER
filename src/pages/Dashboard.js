import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [days, setDays] = useState(7);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =========================
  // FETCH DASHBOARD
  // =========================

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

  // =========================
  // FETCH ANALYTICS
  // =========================

  const fetchAnalytics = async (
    selectedDays
  ) => {
    try {
      setAnalyticsLoading(true);

      const response = await api.get(
        `/dashboard/analytics?days=${selectedDays}`
      );

      setAnalytics(
        response.data.analytics
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          "Failed to load sales analytics"
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !dashboard) {
    return (
      <div className="dashboard-error">
        {error}
      </div>
    );
  }

  // =========================
  // NO DATA
  // =========================

  if (!dashboard) {
    return (
      <div className="dashboard-loading">
        No dashboard data available.
      </div>
    );
  }

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    fetchDashboard();
    fetchAnalytics(days);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="dashboard">

      {/* =========================
          HEADER
      ========================== */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your business
            performance
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
        >
          Refresh
        </button>

      </div>


      {/* =========================
          KPI CARDS
      ========================== */}

      <div className="dashboard-cards">

        {/* TODAY'S REVENUE */}

        <div className="dashboard-card">

          <h3>
            Today's Revenue
          </h3>

          <p>
            KES{" "}
            {Number(
              dashboard.today_revenue || 0
            ).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}
          </p>

        </div>


        {/* TODAY'S TRANSACTIONS */}

        <div className="dashboard-card">

          <h3>
            Today's Transactions
          </h3>

          <p>
            {dashboard.today_transactions || 0}
          </p>

        </div>


        {/* TOTAL PRODUCTS */}

        <div className="dashboard-card">

          <h3>
            Total Products
          </h3>

          <p>
            {dashboard.total_products || 0}
          </p>

        </div>


        {/* LOW STOCK */}

        <div
          className={`dashboard-card ${
            dashboard.low_stock_products > 0
              ? "warning"
              : ""
          }`}
        >

          <h3>
            Low Stock
          </h3>

          <p>
            {dashboard.low_stock_products || 0}
          </p>

        </div>


        {/* CUSTOMERS */}

        <div className="dashboard-card">

          <h3>
            Total Customers
          </h3>

          <p>
            {dashboard.total_customers || 0}
          </p>

        </div>

      </div>


      {/* =========================
          SALES ANALYTICS
      ========================== */}

      <div className="dashboard-section">

        <div className="analytics-header">

          <div>

            <h2>
              Sales Analytics
            </h2>

            {analytics && (
              <p>
                {days}-day revenue:{" "}

                <strong>
                  KES{" "}
                  {Number(
                    analytics.total_revenue || 0
                  ).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}
                </strong>
              </p>
            )}

          </div>


          {/* PERIOD SELECTOR */}

          <div className="period-selector">

            <button
              type="button"
              className={
                days === 7
                  ? "period-button active"
                  : "period-button"
              }
              onClick={() => setDays(7)}
            >
              7 Days
            </button>

            <button
              type="button"
              className={
                days === 30
                  ? "period-button active"
                  : "period-button"
              }
              onClick={() => setDays(30)}
            >
              30 Days
            </button>

          </div>

        </div>


        {/* CHART */}

        {analyticsLoading ? (

          <p>
            Loading sales analytics...
          </p>

        ) : analytics ? (

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <LineChart
                data={
                  analytics.daily || []
                }
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(
                      date
                    ).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric"
                      }
                    )
                  }
                />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `KES ${Number(
                      value
                    ).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }
                    )}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <p>
            No analytics data available.
          </p>

        )}

      </div>


      {/* =========================
          BEST SELLING PRODUCTS
      ========================== */}

      <div className="dashboard-section">

        <h2>
          Best-Selling Products
        </h2>

        {!analytics ||
        !analytics.best_selling_products ||
        analytics.best_selling_products.length ===
          0 ? (

          <p>
            No product sales recorded
            during this period.
          </p>

        ) : (

          <div className="sales-table-wrapper">

            <table className="sales-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>

              </thead>

              <tbody>

                {analytics.best_selling_products.map(
                  (product) => (

                    <tr key={product.id}>

                      <td>
                        {product.name}
                      </td>

                      <td>
                        {product.quantity_sold}
                      </td>

                      <td>
                        KES{" "}
                        {Number(
                          product.revenue || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================
          LOW STOCK PRODUCTS
      ========================== */}

      <div className="dashboard-section">

        <h2>
          Low-Stock Products
        </h2>

        {!analytics ||
        !analytics.low_stock_products ||
        analytics.low_stock_products.length ===
          0 ? (

          <p>
            All products are sufficiently
            stocked.
          </p>

        ) : (

          <div className="sales-table-wrapper">

            <table className="sales-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {analytics.low_stock_products.map(
                  (product) => (

                    <tr key={product.id}>

                      <td>
                        {product.name}
                      </td>

                      <td>
                        {product.quantity}
                      </td>

                      <td>
                        {product.threshold}
                      </td>

                      <td>
                        <strong>
                          Low Stock
                        </strong>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =========================
          INVENTORY OVERVIEW
      ========================== */}

      <div className="dashboard-section">

        <h2>
          Inventory Overview
        </h2>

        <div className="inventory-overview">

          <div className="inventory-item">

            <span>
              Total units in stock
            </span>

            <strong>
              {dashboard.total_inventory || 0}
            </strong>

          </div>


          <div className="inventory-item">

            <span>
              Total revenue
            </span>

            <strong>
              KES{" "}
              {Number(
                dashboard.total_revenue || 0
              ).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          RECENT SALES
      ========================== */}

      <div className="dashboard-section">

        <h2>
          Recent Sales
        </h2>

        {!dashboard.recent_sales ||
        dashboard.recent_sales.length ===
          0 ? (

          <p>
            No sales recorded yet.
          </p>

        ) : (

          <div className="sales-table-wrapper">

            <table className="sales-table">

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

                {dashboard.recent_sales.map(
                  (sale) => (

                    <tr key={sale.id}>

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
                          sale.unit_price || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}
                      </td>

                      <td>
                        KES{" "}
                        {Number(
                          sale.total_amount || 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}
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

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;