import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Store, Phone, MapPin, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthAdvert from "../components/AuthAdvert";
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
    currency: "KES",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
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
      <AuthAdvert />

      <div className="auth-card">
        <div className="auth-card-icon">
          <UserPlus size={24} />
        </div>

        <h1>Create Account</h1>
        <p>Set up your business account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <h2>Your Details</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <UserPlus size={16} />
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
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
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
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
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
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
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
          </div>

          <h2>Business Details</h2>

          <div className="form-group">
            <label htmlFor="business_name">Business Name</label>
            <div className="input-with-icon">
              <Store size={16} />
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
          </div>

          <div className="form-group">
            <label htmlFor="business_type">Business Type</label>
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
            <label htmlFor="business_phone">Business Phone</label>
            <div className="input-with-icon">
              <Phone size={16} />
              <input
                id="business_phone"
                type="tel"
                name="business_phone"
                value={formData.business_phone}
                onChange={handleChange}
                placeholder="0700000000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="business_email">Business Email</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                id="business_email"
                type="email"
                name="business_email"
                value={formData.business_email}
                onChange={handleChange}
                placeholder="business@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="business_address">Business Address</label>
            <div className="input-with-icon">
              <MapPin size={16} />
              <input
                id="business_address"
                type="text"
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
                placeholder="Nairobi"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <div className="input-with-icon">
              <Coins size={16} />
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;