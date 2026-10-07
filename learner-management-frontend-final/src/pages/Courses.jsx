import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import CourseForm from "../components/CourseForm.jsx";

export default function Courses() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, course = edit

  async function load() {
    try {
      const list = await api.getCourses();
      setCourses(list);
      if (!isAdmin) {
        const mine = await api.getStudentEnrollments(user.userId);
        setEnrolledIds(new Set(mine.map((e) => e.course.id)));
      }
    } catch (err) {
      toast.error(err.message);
      setCourses([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () => [...new Set((courses || []).map((c) => c.category).filter(Boolean))].sort(),
    [courses]
  );

  const shown = (courses || []).filter((c) => {
    const text = `${c.courseName} ${c.mentorName}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (!cat || c.category === cat);
  });

  async function enroll(courseId) {
    try {
      await api.enroll(user.userId, courseId);
      setEnrolledIds(new Set([...enrolledIds, courseId]));
      toast.success("You're enrolled.");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function save(form) {
    try {
      if (editing.id) {
        await api.updateCourse(editing.id, form);
        toast.success("Course updated.");
      } else {
        await api.addCourse(form);
        toast.success("Course added.");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(course) {
    if (!window.confirm(`Delete "${course.courseName}"? This can't be undone.`)) return;
    try {
      await api.deleteCourse(course.id);
      toast.success("Course deleted.");
      load();
    } catch (err) {
      toast.error(
        "Couldn't delete this course. Students may still be enrolled in it."
      );
    }
  }

  return (
    <>
      <PageHeader
        title={isAdmin ? "Courses" : "Browse courses"}
        subtitle={isAdmin ? "Add, edit and remove the courses students can join." : "Pick a course to see what it covers."}
        action={isAdmin && <button className="btn" onClick={() => setEditing({})}>Add course</button>}
      />

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by course or mentor"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search courses"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {courses === null ? (
        <p className="muted">Loading courses…</p>
      ) : shown.length === 0 ? (
        <div className="empty">
          <p>{courses.length === 0 ? "No courses yet." : "No courses match your search."}</p>
          {isAdmin && courses.length === 0 && (
            <button className="btn" onClick={() => setEditing({})}>Add the first course</button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Duration</th>
                <th>Category</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link className="strong" to={`/courses/${c.id}`}>{c.courseName}</Link>
                  </td>
                  <td>{c.mentorName}</td>
                  <td>{c.duration}</td>
                  <td>{c.category ? <span className="tag">{c.category}</span> : "—"}</td>
                  <td className="actions">
                    {isAdmin ? (
                      <>
                        <button className="btn btn-small btn-ghost" onClick={() => setEditing(c)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => remove(c)}>Delete</button>
                      </>
                    ) : enrolledIds.has(c.id) ? (
                      <Link className="btn btn-small btn-ghost" to={`/watch/${c.id}`}>Open course</Link>
                    ) : (
                      <button className="btn btn-small" onClick={() => enroll(c.id)}>Enroll</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <CourseForm course={editing.id ? editing : null} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}
