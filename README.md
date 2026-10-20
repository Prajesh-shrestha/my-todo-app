# Cross-Platform Real-Time Task Management System

**Live Web Demo:** [Insert your Vercel URL here]

---

##  Executive Summary
This repository contains a full-stack, cross-platform task management system built with a dual-frontend architecture: a **Next.js (React/TypeScript)** web client and a **Flutter (Dart)** mobile client. Both applications interface directly with a centralized **Firebase Cloud Firestore** NoSQL database via persistent WebSocket connections, ensuring sub-second real-time state synchronization across devices without manual API polling or page refreshes.

---

##  Tech Stack & Architecture

* **Web Client:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Mobile Client:** Flutter, Dart
* **Backend & Database:** Firebase Cloud Firestore (NoSQL, WebSockets)
* **Deployment & CI/CD:** Vercel (Web Hosting), GitHub (Version Control)
* **Configuration & Security:** Dotenv (`.env.local`), Git ignore rules

---

##  Complete Engineering Chronology & Problem-Solving Journey

### 1. Initial Implementation & Baseline Setup
* **What We Did:** 
  * Installed Node.js, VS Code, and Git on Windows.
  * Scaffolded a Next.js web application (`my-todo-app`) with TypeScript and Tailwind CSS using `npx create-next-app`.
  * Designed an in-memory To-Do list UI (`src/app/page.tsx`) with dynamic input fields and dark-mode support.
* **Why We Did It:** To establish a modern web application structure using industry-standard tools before integrating external backend services.

---

### 2. Cloud Database Integration (Firebase Firestore)
* **What We Did:** 
  * Provisioned a Cloud Firestore database on the Firebase Console.
  * Installed the `firebase` npm SDK and configured client authentication keys in `src/firebase.ts`.
  * Replaced temporary React memory (`useState`) with Firestore database methods (`addDoc` and `onSnapshot`).
* **Why We Did It:** A client-only app loses its state upon browser refresh. Firebase acts as a Serverless Backend-as-a-Service (BaaS), storing tasks permanently in the cloud and streaming live updates to all open clients via WebSockets.

---

### 3. Iterative Feature Upgrade: Task Expiration & State Management
* **What Changed:** Upgraded the system from simple string-based tasks to structured task objects containing `completed`, `completedAt`, and `createdAt` metadata fields. Introduced a custom 24-hour client-side task expiration engine.
* **Problems Faced & Solutions:**
  * **Problem 1: Missing Document Fields Crashing Flutter (`Bad state: field "text" does not exist`).**
    * *Cause:* Old database documents created during early testing lacked the new `completed` or `text` fields required by strict type checks.
    * *Fix:* Updated the Dart code in `lib/main.dart` with defensive data extraction (`as Map<String, dynamic>?`) and fallback values (`containsKey('text')`) to parse incomplete documents safely.
  * **Problem 2: Next.js SSR Hydration Error During Production Build.**
    * *Cause:* Calling `useState(Date.now())` directly caused a mismatch between the server-pre-rendered static HTML and the client's local browser time (`blocking-prerender-current-time-client`).
    * *Fix:* Initialized state to `0` (`useState(0)`) and populated the timestamp inside a client-side `useEffect` hook that executes exclusively after DOM mounting.

---

### 4. Cross-Platform Expansion (Flutter & Dart)
* **What We Did:** 
  * Installed the Flutter SDK in `C:\src\flutter`, configured the Dart VS Code extension, and enabled Windows Developer Mode to support plugin symlinks.
  * Initialized a native Flutter application (`todomobile`).
  * Linked the mobile client to the existing Firestore database using `flutterfire_cli` and `firebase_options.dart`.
  * Built a matching UI in `lib/main.dart` using a `StreamBuilder` and a periodic `Timer` to handle live countdown updates.
* **Why We Did It:** To validate cross-platform interoperability by proving that two distinct codebases (TypeScript/React and Dart/Flutter) can seamlessly share the same cloud data layer in real time.

---

### 5. Security Hardening & Deployment Troubleshooting
* **What Changed:** Moved plain-text API configuration keys out of source code (`src/firebase.ts`) into a secure `.env.local` file using Next.js client-side variable conventions (`NEXT_PUBLIC_`).
* **Problems Faced & Solutions:**
  * **Problem 1: Hardcoded API keys lingering in Git commit history.**
    * *Cause:* Keys pushed in earlier commits remain visible in Git history even if deleted from current source files.
    * *Fix:* Verified `.gitignore` rules (`.env*`), rotated the API keys on the Firebase Console to invalidate historical credentials, and re-linked the new keys securely through environment variables.
  * **Problem 2: Vercel Production Build Disconnected from Database.**
    * *Cause:* Local `.env.local` files are intentionally excluded from Git pushes (`.gitignore`). Without configured environment variables on Vercel, the production web build failed to initialize Firebase.
    * *Fix:* Configured `NEXT_PUBLIC_` environment variables within Vercel's Project Settings dashboard and triggered a clean redeployment.
  * **Problem 3: Live Link Prompting Users for Vercel Login ("Deployment Protection").**
    * *Cause:* Vercel enforces "Vercel Authentication" by default on newly created projects, restricting public access.
    * *Fix:* Disabled Deployment Protection in Vercel's Security Settings, making the live `.vercel.app` URL publicly accessible to anyone without authentication.

---

##  Division of Labor (Developer vs. AI Collaborator)

### What I Solved & Handled (Developer):
* **Environment & Infrastructure Execution:** Executed all terminal installation commands (Node.js, Git, Flutter SDK, Firebase CLI) and managed PowerShell directory structures (`cd`, `Remove-Item`).
* **System Settings & Permissions:** Enabled Windows Developer Mode (`start ms-settings:developers`) to resolve file symlink restrictions required by Flutter plugins.
* **Platform Account Management:** Set up Google Firebase projects, created GitHub repositories, configured Vercel deployment pipelines, and performed credential authentication via terminal interfaces (`firebase login`).
* **UI/UX Testing & Debugging:** Verified real-time cross-platform state sync across browser windows, Vercel production links, and local mobile dev environments.

### What the AI Collaborator Assisted With (AI):
* **Code Generation & Refactoring:** Wrote full TypeScript (`page.tsx`) and Dart (`main.dart`) source files, incorporating state management and real-time database listeners.
* **Bug Diagnosis & Fixes:** Interpreted terminal build traces, deployment logs, and visual error screens (e.g., Next.js hydration mismatches, missing Firestore fields, path resolution issues).
* **Architecture Design:** Provided guidance on client-side 24-hour expiration strategies, NoSQL data structures, and continuous deployment workflows.

---

##  Technical Legend & Function Reference

###  Next.js / TypeScript / React Functions

| Function / API | Syntax / Source | Description & Purpose |
| :--- | :--- | :--- |
| `useState()` | `React` | Initializes local state variables (`tasks`, `input`, `now`) to trigger UI re-renders when data changes. |
| `useEffect()` | `React` | Executes side-effects after component rendering. Used to set up client-side timers and subscribe to Firestore snapshot streams. |
| `onSnapshot()` | `firebase/firestore` | Sets up a persistent WebSocket listener on a Firestore collection. Fires a callback instantly whenever database data changes. |
| `addDoc()` | `firebase/firestore` | Asynchronously appends a new document object to a specified Firestore collection. |
| `updateDoc()` | `firebase/firestore` | Modifies specific fields of an existing Firestore document without overwriting the entire document. |
| `doc()` | `firebase/firestore` | Returns a reference to a specific document within a Firestore collection using its unique ID. |
| `serverTimestamp()` | `firebase/firestore` | Generates a standardized UTC timestamp on Firebase servers, eliminating client clock variance. |
| `process.env` | `Node.js / Next.js` | Reads environment variables defined in `.env.local` (prefixed with `NEXT_PUBLIC_` for client exposure). |

###  Flutter / Dart Functions

| Function / API | Syntax / Source | Description & Purpose |
| :--- | :--- | :--- |
| `Firebase.initializeApp()` | `firebase_core` | Asynchronously initializes the Firebase SDK on the client device using platform options from `firebase_options.dart`. |
| `StreamBuilder` | `flutter/widgets` | A Flutter widget that listens to a continuous data stream (Firestore snapshots) and automatically rebuilds its child UI tree when new data arrives. |
| `Timer.periodic()` | `dart:async` | Executes a callback function at specified time intervals (e.g., every 1 second) to force local UI re-renders for live countdown timers. |
| `setState()` | `flutter/widgets` | Flags the Flutter framework that internal object state has changed, scheduling a `build()` method execution to refresh the screen. |
| `FieldValue.serverTimestamp()` | `cloud_firestore` | Generates a server-side timestamp for Firestore operations in Dart. |
| `ListView.builder()` | `flutter/widgets` | Efficiently renders a scrollable list of widgets on demand, constructing only the items currently visible on screen. |

---

##  Local Setup Instructions

### Prerequisites
* Node.js (v18+)
* Flutter SDK (v3.x+)
* Git

### Web Application Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/Prajesh-shrestha/my-todo-app.git](https://github.com/Prajesh-shrestha/my-todo-app.git)
   cd my-todo-app
Install dependencies:

Bash
npm install
Create a .env.local file in the root directory:

Code snippet
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
Start the development server:

Bash
npm run dev
Mobile Application Setup
Navigate to the mobile directory:

Bash
cd app/todomobile
Install Flutter packages:

Bash
flutter pub get
Run the app:

Bash
flutter run