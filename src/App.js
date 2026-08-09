import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <p>{user.email}</p>

      <p>Role: {user.role}</p>

      <p>Business ID: {user.business_id}</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default App;