return (
  <div className="auth-page">
    <div className="auth-card">
      <h2 className="auth-title">RideWise</h2>
      <p className="auth-sub">Login to your account</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="auth-btn">
          Login
        </button>
      </form>

      <div className="auth-footer">
        Don’t have an account? <Link to="/signup">Create one</Link>
      </div>
    </div>
  </div>
);
