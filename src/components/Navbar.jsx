import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 16px",
        background: "#1e293b",
      }}
    >
      <Link to="/" style={{ color: "white" }}>Student Dashboard</Link>
    </nav>
  );
}