import { useState } from "react";
import Modal from "./Modal.jsx";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

const EMPTY = {
  courseName: "",
  mentorName: "",
  duration: "",
  category: "",
  description: "",
  content: "",
  requirements: "",
};

export default function CourseForm({ course, onSave, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ ...EMPTY, ...(course || {}) });
  const [saving, setSaving] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [progress, setProgress] = useState(null); // null = not uploading, 0-100 = uploading
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const uploading = progress !== null;

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  async function onFile(e) {
    const file = e.target.files[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setProgress(0);
    try {
      const res = await api.uploadVideo(file, setProgress);
      const title = lessonTitle.trim() || file.name.replace(/\.[^.]+$/, "");
      const line = `${title} | ${res.url}`;
      setForm((f) => ({ ...f, content: (f.content ? f.content.replace(/\s+$/, "") + "\n" : "") + line }));
      setLessonTitle("");
      toast.success("Video uploaded and added as a lesson.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <Modal title={course ? "Edit course" : "Add course"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label>
          Course name
          <input value={form.courseName} onChange={set("courseName")} required />
        </label>
        <div className="row">
          <label>
            Mentor
            <input value={form.mentorName} onChange={set("mentorName")} required />
          </label>
          <label>
            Duration
            <input value={form.duration} onChange={set("duration")} placeholder="e.g. 8 weeks" required />
          </label>
        </div>
        <label>
          Category
          <input value={form.category || ""} onChange={set("category")} placeholder="e.g. Web development" />
        </label>
        <label>
          Description
          <textarea rows="3" value={form.description || ""} onChange={set("description")} />
        </label>

        <label>
          Lessons
          <textarea
            rows="5"
            value={form.content || ""}
            onChange={set("content")}
            placeholder={"One lesson per line, e.g.\nIntro to React | /api/videos/abc123.mp4\nWhat is JSX"}
          />
        </label>

        <div className="upload-box">
          <div className="upload-row">
            <input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Lesson title (optional)"
              aria-label="Lesson title for the video you upload"
              disabled={uploading}
            />
            <label className={uploading ? "btn btn-ghost btn-small file-btn disabled" : "btn btn-ghost btn-small file-btn"}>
              {uploading ? `Uploading… ${progress}%` : "Upload video"}
              <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v" hidden onChange={onFile} disabled={uploading} />
            </label>
          </div>
          {uploading && <div className="bar"><span style={{ width: `${progress}%` }} /></div>}
          <p className="upload-hint">
            Choose a video from your computer. It's added to the lessons above as a new line. MP4 (H.264) or WebM plays best.
          </p>
        </div>

        <label>
          Requirements
          <textarea rows="3" value={form.requirements || ""} onChange={set("requirements")} placeholder="One requirement per line" />
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={saving || uploading}>{saving ? "Saving…" : "Save course"}</button>
        </div>
      </form>
    </Modal>
  );
}
