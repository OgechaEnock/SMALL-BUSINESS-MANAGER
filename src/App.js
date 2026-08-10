import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";


import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import "./App.css";


function DashboardLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="app-main">
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
               path="/register"
               element={<Register />}
            />
            
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/inventory"
              element={<Inventory />}
            />
            <Route
              path="/sales"
              element={<Sales />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={<DashboardLayout />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}


export default App;