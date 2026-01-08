import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Welcome to RideWise</h1>
      <p>{user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
