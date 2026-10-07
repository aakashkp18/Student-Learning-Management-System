import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StudentForm from "../components/StudentForm.jsx";

export default function Students() {
  const toast = useToast();
  const [students, setStudents] = useState(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // null closed, {} new, student edit

  async function load() {
    try {
      setStudents(await api.getStudents());
    } catch (err) {
      toast.error(err.message);
      setStudents([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(form) {
    try {
      if (editing.id) {
        await api.updateStudent(editing.id, form);
        toast.success("Student updated.");
      } else {
        await api.addStudent(form);
        toast.success("Student added.");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(s) {
    if (!window.confirm(`Delete student "${s.username}"?`)) return;
    try {
      await api.deleteStudent(s.id);
      toast.success("Student deleted.");
      load();
    } catch {
      toast.error("Couldn't delete this student. They may still have enrollments.");
    }
  }

  const shown = (students || []).filter((s) => s.username.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Everyone who has registered as a student."
        action={<button className="btn" onClick={() => setEditing({})}>Add student</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Search by username" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
      </div>

      {students === null ? (
        <p className="muted">Loading students…</p>
      ) : shown.length === 0 ? (
        <div className="empty"><p>{students.length === 0 ? "No students have registered yet." : "No students match your search."}</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Username</th><th aria-label="Actions"></th></tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><Link className="strong" to={`/students/${s.id}`}>{s.username}</Link></td>
                  <td className="actions">
                    <Link className="btn btn-small btn-ghost" to={`/students/${s.id}`}>Details</Link>
                    <button className="btn btn-small btn-ghost" onClick={() => setEditing(s)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <StudentForm student={editing.id ? editing : null} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}
