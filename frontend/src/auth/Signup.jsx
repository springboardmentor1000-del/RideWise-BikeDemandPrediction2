return (
  <div className="auth-page">
    <div className="auth-card">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-sub">Join RideWise today</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input name="name" placeholder="Full name" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email address" required onChange={handleChange} />
        <input name="mobile" placeholder="Mobile number" required onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          required
          onChange={handleChange}
        />

        <button type="submit" className="auth-btn">
          Sign Up
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  </div>
);
