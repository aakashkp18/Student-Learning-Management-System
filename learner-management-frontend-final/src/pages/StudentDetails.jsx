import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { fmtDate } from "../utils/helpers.js";

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.all([api.getStudent(id), api.getStudentEnrollments(id)]);
        setStudent(s);
        setEnrollments(e);
      } catch (err) {
        setError(err.message === "Request failed (500)" ? "This student doesn't exist." : err.message);
      }
    })();
  }, [id]);

  if (error) return <div className="empty"><p>{error}</p><Link className="btn" to="/students">Back to students</Link></div>;
  if (!student) return <p className="muted">Loading student…</p>;

  return (
    <article className="detail">
      <Link to="/students" className="back">‹ All students</Link>
      <header className="detail-head">
        <div>
          <h1>{student.username}</h1>
          <dl className="facts">
            <div><dt>Student ID</dt><dd>{student.id}</dd></div>
            <div><dt>Role</dt><dd>Student</dd></div>
            <div><dt>Courses enrolled</dt><dd>{enrollments.length}</dd></div>
          </dl>
        </div>
      </header>

      <section>
        <h2>Enrollments</h2>
        {enrollments.length === 0 ? (
          <p className="muted">This student hasn't enrolled in any course yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Course</th><th>Instructor</th><th>Enrolled on</th><th>Status</th></tr></thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td><Link className="strong" to={`/courses/${e.course.id}`}>{e.course.courseName}</Link></td>
                    <td>{e.course.mentorName}</td>
                    <td>{fmtDate(e.enrollmentDate)}</td>
                    <td><span className="badge badge-ok">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}
