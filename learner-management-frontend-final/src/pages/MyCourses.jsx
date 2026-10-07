import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fmtDate, getProgress, parseLessons } from "../utils/helpers.js";

export default function MyCourses() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .getStudentEnrollments(user.userId)
      .then(setItems)
      .catch((err) => {
        toast.error(err.message);
        setItems([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title="My courses" subtitle="Courses you've enrolled in." />
      {items === null ? (
        <p className="muted">Loading your courses…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>You haven't enrolled in any courses yet.</p>
          <Link className="btn" to="/courses">Browse courses</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Enrolled on</th>
                <th>Status</th>
                <th>Progress</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => {
                const total = parseLessons(e.course).length;
                const done = getProgress(user.userId, e.course.id).filter((i) => i < total).length;
                const pct = Math.round((done / total) * 100);
                return (
                  <tr key={e.id}>
                    <td><Link className="strong" to={`/courses/${e.course.id}`}>{e.course.courseName}</Link></td>
                    <td>{e.course.mentorName}</td>
                    <td>{fmtDate(e.enrollmentDate)}</td>
                    <td><span className="badge badge-ok">{e.status}</span></td>
                    <td>
                      <div className="bar" aria-label={`${pct}% complete`}><span style={{ width: `${pct}%` }} /></div>
                      <small className="muted">{done} of {total} lessons</small>
                    </td>
                    <td className="actions">
                      <Link className="btn btn-small" to={`/watch/${e.course.id}`}>
                        {done === 0 ? "Start" : done === total ? "Review" : "Continue"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
