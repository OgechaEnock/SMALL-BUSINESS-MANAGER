function AuthAdvert() {
  const features = [
    "Sales",
    "Inventory",
    "Customers",
    "Expenses",
    "Dashboard"
  ];

  return (
    <div className="auth-advert">
      <h2>Manage Your Business With Ease</h2>

      <p>
        A simple all-in-one tool to track your sales, manage your stock,
        keep tabs on your customers, and monitor your expenses — all in
        one place.
      </p>

      <div className="auth-advert-features">
        {features.map((feature) => (
          <span
            key={feature}
            className="auth-advert-chip"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

export default AuthAdvert;