import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/courses", label: "Courses" },
        { to: "/students", label: "Students" },
        { to: "/enrollments", label: "Enrollments" },
      ]
    : [
        { to: "/courses", label: "Browse courses" },
        { to: "/my-courses", label: "My courses" },
      ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Learner<br />Management</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "nav active" : "nav")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <div className="who-name">{user.username}</div>
          <div className="who-role">{isAdmin ? "Administrator" : "Student"}</div>
          <button
            className="btn btn-ghost-light"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
