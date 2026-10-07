import { useState } from "react";
import Modal from "./Modal.jsx";

export default function StudentForm({ student, onSave, onClose }) {
  const [form, setForm] = useState({
    username: student?.username || "",
    password: student?.password || "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={student ? "Edit student" : "Add student"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label>
          Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={saving}>{saving ? "Saving…" : "Save student"}</button>
        </div>
      </form>
    </Modal>
  );
}
