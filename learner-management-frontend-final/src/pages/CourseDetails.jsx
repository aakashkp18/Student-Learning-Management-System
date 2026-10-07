import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { splitLines } from "../utils/helpers.js";

export default function CourseDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCourse(await api.getCourse(id));
        if (!isAdmin) {
          const mine = await api.getStudentEnrollments(user.userId);
          setEnrolled(mine.some((e) => String(e.course.id) === String(id)));
        }
      } catch (err) {
        setError(err.message === "Request failed (500)" ? "This course doesn't exist." : err.message);
      }
    })();
  }, [id, isAdmin, user.userId]);

  async function enroll() {
    setBusy(true);
    try {
      await api.enroll(user.userId, Number(id));
      setEnrolled(true);
      toast.success("You're enrolled.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="empty">
        <p>{error}</p>
        <Link className="btn" to="/courses">Back to courses</Link>
      </div>
    );
  }
  if (!course) return <p className="muted">Loading course…</p>;

  const topics = splitLines(course.content);
  const reqs = splitLines(course.requirements);

  return (
    <article className="detail">
      <Link to="/courses" className="back">‹ All courses</Link>
      <header className="detail-head">
        <div>
          {course.category && <span className="tag">{course.category}</span>}
          <h1>{course.courseName}</h1>
          <dl className="facts">
            <div><dt>Instructor</dt><dd>{course.mentorName}</dd></div>
            <div><dt>Duration</dt><dd>{course.duration}</dd></div>
          </dl>
        </div>
        {!isAdmin && (
          <div className="detail-cta">
            {enrolled ? (
              <>
                <span className="badge badge-ok">Enrolled</span>
                <Link className="btn" to={`/watch/${course.id}`}>Start learning</Link>
              </>
            ) : (
              <button className="btn" onClick={enroll} disabled={busy}>
                {busy ? "Enrolling…" : "Enroll in this course"}
              </button>
            )}
          </div>
        )}
      </header>

      <section>
        <h2>About this course</h2>
        <p className="prose">{course.description || "No description has been added yet."}</p>
      </section>

      <div className="two-col">
        <section>
          <h2>What you'll learn</h2>
          {topics.length ? (
            <ul className="checklist">{topics.map((t, i) => <li key={i}>{t}</li>)}</ul>
          ) : (
            <p className="muted">Course content hasn't been added yet.</p>
          )}
        </section>
        <section>
          <h2>Requirements</h2>
          {reqs.length ? (
            <ul className="bullets">{reqs.map((t, i) => <li key={i}>{t}</li>)}</ul>
          ) : (
            <p className="muted">No special requirements.</p>
          )}
        </section>
      </div>
    </article>
  );
}
