import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div>
        <strong>
          Small Business Manager
        </strong>
      </div>

      <div>
        <span>
          {user?.name}
        </span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;