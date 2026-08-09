import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <h2>Small Business Manager</h2>

      <nav>
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/sales">
          Sales
        </Link>

        <Link to="/expenses">
          Expenses
        </Link>

        <Link to="/inventory">
          Inventory
        </Link>

        <Link to="/customers">
          Customers
        </Link>

        <Link to="/reports">
          Reports
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;