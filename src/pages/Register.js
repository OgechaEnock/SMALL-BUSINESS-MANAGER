import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    business_name: "",
    business_type: "",
    business_phone: "",
    business_email: "",
    business_address: "",
    currency: "KES"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { confirm_password, ...payload } = formData;

    const result = await register(payload);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Create Account</h1>

        <p>
          Set up your business account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <h2>Your Details</h2>

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={8}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="confirm_password">
              Confirm Password
            </label>

            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter your password"
              minLength={8}
              required
            />

          </div>


          <h2>Business Details</h2>

          <div className="form-group">

            <label htmlFor="business_name">
              Business Name
            </label>

            <input
              id="business_name"
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Your business name"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="business_type">
              Business Type
            </label>

            <input
              id="business_type"
              type="text"
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              placeholder="e.g. Retail, Technology"
            />

          </div>

          <div className="form-group">

            <label htmlFor="business_phone">
              Business Phone
            </label>

            <input
              id="business_phone"
              type="tel"
              name="business_phone"
              value={formData.business_phone}
              onChange={handleChange}
              placeholder="0700000000"
            />

          </div>

          <div className="form-group">

            <label htmlFor="business_email">
              Business Email
            </label>

            <input
              id="business_email"
              type="email"
              name="business_email"
              value={formData.business_email}
              onChange={handleChange}
              placeholder="business@example.com"
            />

          </div>

          <div className="form-group">

            <label htmlFor="business_address">
              Business Address
            </label>

            <input
              id="business_address"
              type="text"
              name="business_address"
              value={formData.business_address}
              onChange={handleChange}
              placeholder="Nairobi"
            />

          </div>

          <div className="form-group">

            <label htmlFor="currency">
              Currency
            </label>

            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="KES">
                KES - Kenyan Shilling
              </option>

              <option value="USD">
                USD - US Dollar
              </option>

              <option value="EUR">
                EUR - Euro
              </option>

              <option value="GBP">
                GBP - British Pound
              </option>

            </select>

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;