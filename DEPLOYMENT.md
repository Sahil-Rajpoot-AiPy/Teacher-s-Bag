# Deployment Checklist

## 1. Local verification
1. Install deps: `npm install`
2. Typecheck: `npm run lint`
3. Production build: `npm run build`

## 2. Environment variables
Set these in your deployment environment:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

## 3. Firestore security and indexes
This repo now tracks:
- `firestore.rules`
- `firestore.indexes.json`

Deploy them with:
- `firebase deploy --only firestore:rules,firestore:indexes`

## 4. Bootstrap admin account
1. Create admin user in Firebase Authentication (email/password).
2. Create Firestore doc at `users/{uid}` with:
   - `uid`
   - `name`
   - `email`
   - `role: "admin"`

## 5. Deploy hosting
1. Build: `npm run build`
2. Deploy: `firebase deploy --only hosting`

## 6. Post-deploy smoke test
1. Teacher login -> lands on `/portal`.
2. Admin login -> lands on `/admin`.
3. Admin can create class/subject/lesson/user (teacher only).
4. Teacher can mark lesson complete and progress persists.
5. A teacher cannot change their own `role`, `uid`, or `email` fields in Firestore.
