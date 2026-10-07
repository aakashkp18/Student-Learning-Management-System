# Learner Management – React frontend

React (Vite) frontend for the Spring Boot `learner-management-backend`.

## Run

1. Start MySQL and the backend (`mvn spring-boot:run`, port 8080).
2. In this folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173. If your backend runs elsewhere, change `VITE_API_URL` in `.env`.

Admin login: `admin` / `admin123` (choose "Admin" on the login screen).

## Pages

| Role    | Route              | What it does                                             |
|---------|--------------------|----------------------------------------------------------|
| Both    | `/login`           | Login with role switch                                   |
| Student | `/register`        | Student registration                                     |
| Student | `/courses`         | Browse courses (search, category filter, enroll)         |
| Both    | `/courses/:id`     | Description, instructor, duration, content, requirements, enroll |
| Student | `/my-courses`      | Enrollments with date, status and lesson progress        |
| Student | `/watch/:courseId` | Lesson player: previous/next, mark completed             |
| Admin   | `/dashboard`       | Totals and latest enrollments                            |
| Admin   | `/courses`         | Add, edit, delete courses                                |
| Admin   | `/students`        | List, add, edit, delete students                         |
| Admin   | `/students/:id`    | Student details and their enrollments                    |
| Admin   | `/enrollments`     | All enrollments: student, course, date, status           |

## Uploading your own videos

Admin → **Courses** → **Add course** / **Edit** → in the **Lessons** area, type an optional lesson title,
click **Upload video** and pick a file. When the upload finishes, a line like
`My lesson | /api/videos/<id>.mp4` is added to the lessons. Click **Save course**.

This needs the updated backend (it adds `VideoController`). Files are saved in `uploads/videos/`
next to where you run the backend. Supported: MP4, WebM, OGG, MOV, M4V (up to 2 GB each).

## Lessons and videos

The backend has no lessons or progress tables, so:

- **Lessons** come from the course's *content* field, one lesson per line.
- **Videos**: add a YouTube link after a `|` on that line, e.g.
  `Intro to React | https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- **Completed lessons** are saved in the browser (localStorage) per student and course.

To store progress in the database later, add a `Lesson` and `LessonProgress` entity and swap
`getProgress`/`setProgress` in `src/utils/helpers.js` for API calls.

## Note on security

The backend stores plain-text passwords, has no tokens, and doesn't check roles on its endpoints.
This frontend hides admin pages from students, but real protection needs Spring Security + JWT on the backend.
