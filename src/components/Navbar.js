import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <strong>
          Small Business Manager
        </strong>
      </div>

      <div className="navbar-user">
        <span className="navbar-user-name">
          {user?.name}
        </span>

        <button
          className="navbar-logout"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;