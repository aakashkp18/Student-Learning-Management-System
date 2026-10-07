import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fmtDate } from "../utils/helpers.js";

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api.getStudents(), api.getCourses(), api.getEnrollments()])
      .then(([students, courses, enrollments]) => setData({ students, courses, enrollments }))
      .catch((err) => {
        toast.error(err.message);
        setData({ students: [], courses: [], enrollments: [] });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <p className="muted">Loading dashboard…</p>;

  const recent = [...data.enrollments].sort((a, b) => b.id - a.id).slice(0, 6);
  const stats = [
    { label: "Registered students", value: data.students.length, to: "/students" },
    { label: "Courses", value: data.courses.length, to: "/courses" },
    { label: "Enrollments", value: data.enrollments.length, to: "/enrollments" },
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user.username}`} subtitle="Here's what's happening across the platform." />

      <div className="stats">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Latest enrollments</h2>
      {recent.length === 0 ? (
        <div className="empty"><p>No one has enrolled yet.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td><Link className="strong" to={`/students/${e.student.id}`}>{e.student.username}</Link></td>
                  <td>{e.course.courseName}</td>
                  <td>{fmtDate(e.enrollmentDate)}</td>
                  <td><span className="badge badge-ok">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
