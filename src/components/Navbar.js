import { useAuth } from "../context/AuthContext";
import { LogOut, Store } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <Store size={20} />
        </div>
        <strong>Small Business Manager</strong>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar" title={user?.name}>
          {initials}
        </div>
        <span className="navbar-user-name">{user?.name}</span>

        <button className="navbar-logout" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;