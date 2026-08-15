import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Users,
  BarChart3,
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Package size={24} />
        </div>
        <h2>Small Business Manager</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;