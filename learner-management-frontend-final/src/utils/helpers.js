import { API_BASE } from "../api/client.js";

export function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * The backend has no lessons table, so lessons come from the course "content"
 * field: one lesson per line. A line can optionally carry a video link:
 *   Intro to React | https://www.youtube.com/watch?v=XXXXXXXXXXX
 */
export function parseLessons(course) {
  const lines = (course?.content || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [{ title: "Course overview", url: null }];
  }
  return lines.map((line) => {
    const [title, url] = line.split("|").map((s) => s.trim());
    return { title: title || line, url: url || null };
  });
}

export function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : null;
}

export function splitLines(text) {
  return (text || "")
    .split("\n")
    .map((l) => l.split("|")[0].trim())
    .filter(Boolean);
}

// Lesson progress is kept in this browser (the backend has no progress API yet).
const key = (userId, courseId) => `lms_progress_${userId}_${courseId}`;

export function getProgress(userId, courseId) {
  try {
    return JSON.parse(localStorage.getItem(key(userId, courseId))) || [];
  } catch {
    return [];
  }
}

export function setProgress(userId, courseId, done) {
  localStorage.setItem(key(userId, courseId), JSON.stringify(done));
}

// Videos uploaded through the admin form are stored as "/api/videos/<file>".
export function isUploadedVideo(url) {
  return !!url && url.startsWith("/api/videos/");
}

export function videoSrc(url) {
  return `${API_BASE}${url}`;
}
