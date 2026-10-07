export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE;

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running on port 8080.");
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // e.g. "Student deleted successfully"
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  login: (username, password, role) =>
    request("/auth/login", { method: "POST", body: { username, password, role } }),
  register: (username, password) =>
    request("/auth/register", { method: "POST", body: { username, password } }),

  // Students
  getStudents: () => request("/students"),
  getStudent: (id) => request(`/students/${id}`),
  addStudent: (student) => request("/students", { method: "POST", body: student }),
  updateStudent: (id, student) => request(`/students/${id}`, { method: "PUT", body: student }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),

  // Courses
  getCourses: () => request("/courses"),
  getCourse: (id) => request(`/courses/${id}`),
  addCourse: (course) => request("/courses", { method: "POST", body: course }),
  updateCourse: (id, course) => request(`/courses/${id}`, { method: "PUT", body: course }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: "DELETE" }),

  // Videos (upload a file from the admin's computer)
  uploadVideo: (file, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE}/api/videos`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let data = null;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          /* not JSON */
        }
        if (xhr.status >= 200 && xhr.status < 300) return resolve(data);
        reject(new Error((data && data.message) || (xhr.status === 413 ? "That file is too large." : `Upload failed (${xhr.status})`)));
      };
      xhr.onerror = () => reject(new Error("Can't reach the server. Make sure the backend is running on port 8080."));
      const body = new FormData();
      body.append("file", file);
      xhr.send(body);
    }),

  // Enrollments
  enroll: (studentId, courseId) =>
    request("/enrollments", { method: "POST", body: { studentId, courseId } }),
  getEnrollments: () => request("/enrollments"),
  getStudentEnrollments: (studentId) => request(`/enrollments/student/${studentId}`),
};
