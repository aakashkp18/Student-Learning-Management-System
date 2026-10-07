import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fmtDate } from "../utils/helpers.js";

export default function Enrollments() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api
      .getEnrollments()
      .then((list) => setItems([...list].sort((a, b) => b.id - a.id)))
      .catch((err) => {
        toast.error(err.message);
        setItems([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = (items || []).filter((e) =>
    `${e.student.username} ${e.course.courseName}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Enrollments" subtitle="Which student enrolled in which course." />
      <div className="toolbar">
        <input className="search" placeholder="Search by student or course" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enrollments" />
      </div>

      {items === null ? (
        <p className="muted">Loading enrollments…</p>
      ) : shown.length === 0 ? (
        <div className="empty"><p>{items.length === 0 ? "No one has enrolled yet." : "No enrollments match your search."}</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Instructor</th><th>Enrolled on</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td><Link className="strong" to={`/students/${e.student.id}`}>{e.student.username}</Link></td>
                  <td><Link to={`/courses/${e.course.id}`}>{e.course.courseName}</Link></td>
                  <td>{e.course.mentorName}</td>
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
