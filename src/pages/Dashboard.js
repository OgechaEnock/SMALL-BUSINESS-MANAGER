import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <p>
        Welcome, {user?.name}
      </p>

      <p>
        {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>

      <p>
        Business ID: {user?.business_id}
      </p>
    </div>
  );
}

export default Dashboard;