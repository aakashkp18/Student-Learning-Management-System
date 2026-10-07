import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getProgress, isUploadedVideo, parseLessons, setProgress, toEmbedUrl, videoSrc } from "../utils/helpers.js";

export default function Watch() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [allowed, setAllowed] = useState(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, mine] = await Promise.all([
          api.getCourse(courseId),
          api.getStudentEnrollments(user.userId),
        ]);
        setCourse(c);
        setAllowed(mine.some((e) => String(e.course.id) === String(courseId)));
        const saved = getProgress(user.userId, courseId);
        setDone(saved);
        const total = parseLessons(c).length;
        const firstOpen = Array.from({ length: total }, (_, i) => i).find((i) => !saved.includes(i));
        setCurrent(firstOpen ?? 0);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [courseId, user.userId]);

  if (error) return <div className="empty"><p>{error}</p><Link className="btn" to="/my-courses">My courses</Link></div>;
  if (!course || allowed === null) return <p className="muted">Loading course…</p>;
  if (!allowed) {
    return (
      <div className="empty">
        <p>You need to enroll in this course before you can watch it.</p>
        <Link className="btn" to={`/courses/${courseId}`}>View course</Link>
      </div>
    );
  }

  const lessons = parseLessons(course);
  const lesson = lessons[current];
  const uploaded = isUploadedVideo(lesson.url);
  const embed = toEmbedUrl(lesson.url);
  const isDone = done.includes(current);
  const pct = Math.round((done.filter((i) => i < lessons.length).length / lessons.length) * 100);

  function toggleDone() {
    const next = isDone ? done.filter((i) => i !== current) : [...done, current];
    setDone(next);
    setProgress(user.userId, courseId, next);
  }

  function markDone() {
    if (done.includes(current)) return;
    const next = [...done, current];
    setDone(next);
    setProgress(user.userId, courseId, next);
  }

  function completeAndNext() {
    if (!isDone) {
      const next = [...done, current];
      setDone(next);
      setProgress(user.userId, courseId, next);
    }
    if (current < lessons.length - 1) setCurrent(current + 1);
  }

  return (
    <div className="watch">
      <section className="player-col">
        <Link to="/my-courses" className="back">‹ My courses</Link>
        <h1>{course.courseName}</h1>

        <div className="player">
          {uploaded ? (
            <video
              key={lesson.url}
              src={videoSrc(lesson.url)}
              controls
              controlsList="nodownload"
              preload="metadata"
              onEnded={markDone}
            />
          ) : embed ? (
            <iframe
              src={embed}
              title={lesson.title}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="player-empty">
              <p className="player-title">{lesson.title}</p>
              {lesson.url ? (
                <a className="btn" href={lesson.url} target="_blank" rel="noreferrer">Open lesson video</a>
              ) : (
                <p className="muted">No video has been added for this lesson.</p>
              )}
            </div>
          )}
        </div>

        <div className="lesson-bar">
          <div>
            <small className="muted">Lesson {current + 1} of {lessons.length}</small>
            <h2>{lesson.title}</h2>
          </div>
          <div className="lesson-actions">
            <button className="btn btn-ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</button>
            <button className={isDone ? "btn btn-ghost" : "btn btn-ghost"} onClick={toggleDone}>
              {isDone ? "Mark as not done" : "Mark as completed"}
            </button>
            <button className="btn" onClick={completeAndNext} disabled={current === lessons.length - 1 && isDone}>
              {current === lessons.length - 1 ? "Complete course" : "Complete and next"}
            </button>
          </div>
        </div>
        {course.description && <p className="prose">{course.description}</p>}
      </section>

      <aside className="lessons">
        <div className="lessons-head">
          <strong>Lessons</strong>
          <small className="muted">{pct}% complete</small>
        </div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <ol>
          {lessons.map((l, i) => (
            <li key={i}>
              <button className={i === current ? "lesson active" : "lesson"} onClick={() => setCurrent(i)}>
                <span className={done.includes(i) ? "dot dot-done" : "dot"} aria-hidden="true">{done.includes(i) ? "✓" : i + 1}</span>
                <span>{l.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
