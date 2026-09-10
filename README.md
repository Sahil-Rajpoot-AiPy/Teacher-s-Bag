# Teacher's Bag

Teacher's Bag is a web application for organizing teaching materials by class and subject, with separate teacher and admin experiences.

> **Status:** In development. The project is functional enough to demonstrate its architecture and core workflows, but it is not yet presented as a finished production product.

## Why I built it

Teachers often keep videos, notes, links, and class resources scattered across devices and apps. Teacher's Bag explores a cleaner way to organize those resources in one place while giving administrators control over users, classes, subjects, and materials.

## Current features

- Firebase Authentication
- Protected teacher routes
- Role-based admin access
- Teacher dashboard
- Class and subject navigation
- Teaching-material views
- Video-material viewing
- Admin dashboard
- User management
- Class management
- Subject management
- Material management
- Lazy-loaded routes for a lighter initial bundle
- Responsive interface built with Tailwind CSS

## Tech stack

- React 19
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

## Application structure

The app currently separates the two main experiences:

### Teacher portal

Authenticated teachers can move through their dashboard, classes, subjects, and learning materials.

### Admin area

Admin-only routes provide management screens for users, classes, subjects, and materials.

## Local development

### Prerequisites

- Node.js
- A Firebase project

### Install

```bash
npm install
```

Create an `.env.local` file and provide the Firebase values used by the application:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Then start the development server:

```bash
npm run dev
```

## Before public release

I still want to improve several areas before treating this as a polished public project:

- Add representative screenshots or a short product demo
- Document the Firestore data model and security rules
- Add clearer setup instructions for sample/demo data
- Add tests for important authentication and role flows
- Review accessibility and responsive behavior
- Deploy a safe demo environment
- Remove remaining scaffold-specific naming and configuration assumptions

## Portfolio note

This project demonstrates full-stack application thinking around authentication, route protection, role-based access, data organization, and administrative workflows. Once the remaining presentation and production-hardening work is complete, I plan to publish it as one of my featured web application projects.
