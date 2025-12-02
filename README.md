# LearnSync

LearnSync (formerly EduMatrix) — a lightweight student attendance and results demo app built with Next.js and TypeScript.

## What this is

A small demo/fullstack-ish frontend that uses browser `localStorage` for data persistence. It demonstrates managing users (student/teacher/admin), simple enrollment functionality, and a lightweight admin/teacher access model.

## Features

- Local demo authentication (users stored in `localStorage`)
- Admin / Teacher assignment controls
- Enroll/unenroll students (data stored in `localStorage`)
- Simple activity logging via `localStorage`
- Tailwind-style component library and UI primitives

## Tech stack

- Next.js (App Router)
- TypeScript
- React
- Tailwind / PostCSS (configured)

## Quick start (Windows / PowerShell)

Install dependencies (npm):

```powershell
npm install
# or, if you prefer pnpm:
# pnpm install
```

Run in development mode:

```powershell
npm run dev
# then open http://localhost:3000
```

Build for production:

```powershell
npm run build
npm start
```

## Notes

- This project uses browser `localStorage` for demo data. To reset demo state in your browser, open DevTools → Application → Local Storage → `http://localhost:3000` and clear the `users`, `courses`, `enrolledStudents`, `activities`, `activeAdmin`, and `activeTeacher` keys.
- The product name in the UI has been changed to **LearnSync**. If you find any other occurrences of the old name (`EduMatrix`) (for example in build artifacts under `.next`), rebuild the app to regenerate them.

## Contributing

Small fixes and improvements welcome. For visual/branding changes consider replacing the product name in `app/layout.tsx` and `app/page.tsx`.

---

*README created by project maintainer tooling.*
