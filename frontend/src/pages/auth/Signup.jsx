import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <h2>Create RideWise Account</h2>
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <input type="password" placeholder="Re-enter Password" />
      <input placeholder="Mobile Number" />
      <button onClick={() => navigate("/")}>Sign Up</button>
    </div>
  );
}
