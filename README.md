# Teacher's Bag

A role-based web application for organizing training and teaching materials by class and subject, with separate teacher and administrator experiences.

> **Status:** Functional portfolio project. Core authentication, role-based navigation, content organization, progress tracking, and admin workflows are implemented. The project is still being refined with stronger testing, demo content, and visual documentation.

## The problem

Teaching and training resources often end up scattered across folders, messaging apps, links, and individual devices. Teacher's Bag explores a simple central portal where teachers can move through structured class material while administrators manage the content and users behind it.

## Core features

### Teacher experience

- Email/password authentication
- Protected application routes
- Dashboard for accessing assigned learning content
- Class → subject → material navigation
- Video-based material viewing
- Per-user completion tracking
- Responsive interface

### Admin experience

- Separate admin-only route hierarchy
- User management
- Class management
- Subject management
- Material management
- Role-aware routing and authorization

## Tech stack

- **React 19**
- **TypeScript**
- **Vite**
- **Firebase Authentication**
- **Cloud Firestore**
- **React Router**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React**

## Architecture

The application separates user-facing and administrative workflows while sharing the same authentication and Firestore-backed data layer.

```text
Authentication
     │
     ├── Teacher
     │    └── Portal → Classes → Subjects → Materials → Progress
     │
     └── Admin
          └── Dashboard → Users / Classes / Subjects / Materials
```

Routes are lazy-loaded to reduce the initial bundle, and protected/admin routes prevent unauthenticated or unauthorized users from entering restricted areas.

## Security model

Firestore rules are included in the repository and follow a deny-by-default approach.

- Core learning content can be read only by authenticated users
- Classes, subjects, and materials can be created, changed, or deleted only by admins
- Users can access their own profile/progress data
- Admins can manage user records
- Unmatched Firestore paths are denied by default

The Firebase client configuration is loaded from environment variables rather than hardcoded credentials.

## Data model

The current Firestore structure is centered around four main collections:

```text
classes
subjects
materials
users
  └── completions
```

User documents carry role information used by the application and Firestore rules to distinguish teacher and administrator capabilities.

## Local development

### Requirements

- Node.js
- npm
- A Firebase project with Authentication and Firestore enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env.local` and fill in your Firebase project values:

```env
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_FIREBASE_MEASUREMENT_ID=""
```

An optional `VITE_ADMIN_EMAILS` value is also supported as a fallback, although Firestore role data is the preferred source of authorization.

### 3. Start the development server

```bash
npm run dev
```

### 4. Verify the project

```bash
npm run lint
npm run build
```

## Firebase deployment

The repository includes Firebase Hosting configuration, Firestore rules, and Firestore index configuration.

```bash
firebase deploy --only firestore:rules,firestore:indexes
npm run build
firebase deploy --only hosting
```

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete deployment checklist and admin bootstrap steps.

## What this project demonstrates

Teacher's Bag is intended to demonstrate more than UI work. It includes practical application concerns such as:

- Authentication
- Role-based access control
- Protected routing
- Cloud-hosted application data
- Firestore security rules
- User-specific progress state
- Admin/user workflow separation
- Responsive component-based frontend development
- Deployment configuration

## Next improvements

- Add representative screenshots and/or a short demo video
- Add automated tests for authentication and role-sensitive workflows
- Add seeded demo content for easier evaluation
- Continue accessibility and responsive-behavior review
- Deploy a safe public demo environment

## Author

Built by **Saaleh Ijaz** as a practical full-stack web application project.

[GitHub Profile](https://github.com/Sahil-Rajpoot-AiPy) · [LinkedIn](https://www.linkedin.com/in/saaleh-ijaz-aipy/)
