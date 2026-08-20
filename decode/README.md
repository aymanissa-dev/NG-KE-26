# De{c0}dE

> Understand code, not just generate it.

De{c0}dE is an AI-powered code analysis app built for **NG Kenya 2026**, as the companion demo for the talk _"From Idea to MVP: Building AI-Powered Angular Apps with Firebase."_

Paste a code snippet and get back a structured breakdown: a plain-language explanation, a step-by-step walkthrough, detected issues with severity ratings, an improvement suggestion, a before/after refactor, a quality score, and follow-up Q&A — all backed by a real AI model, not canned demo data.

## Stack

- **Angular 22** — standalone components, signals, no NgModules
- **Firebase Authentication** — email/password + Google sign-in
- **Cloud Firestore** — user profiles and saved analysis history
- **Hugging Face Inference API** — the code-analysis engine (`@huggingface/inference`, Llama 3.1 8B Instruct)
- **SCSS** — hand-rolled design system, dark/light theme via CSS custom properties

No backend server, no Cloud Functions, no paid infrastructure — everything runs on free tiers, calling Hugging Face and Firebase directly from the browser.

## Prerequisites

- Node.js 24.x
- npm 11.x
- Angular CLI 22.x (`npm install -g @angular/cli`)
- A Firebase project (Authentication + Firestore enabled)
- A free Hugging Face account and access token

## Setup

### 1. Clone and install

\`\`\`bash
git clone https://github.com/aymanissa-dev/NG-KE-26.git
cd NG-KE-26/decode
npm install
\`\`\`

### 2. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in method → turn on **Email/Password** and **Google**
3. Enable **Cloud Firestore** (production mode is fine)
4. In **Firestore Database → Rules**, paste:

\`\`\`
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId} {
allow read: if request.auth != null && request.auth.uid == userId;
allow write: if request.auth != null && request.auth.uid == userId;

      match /analyses/{analysisId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

}
}
\`\`\`

5. Copy your Firebase web config into **both** `src/environments/environment.ts` and `src/environments/environment.development.ts` (Angular's dev build swaps in the `.development.ts` file, so both need it):

\`\`\`typescript
export const environment = {
production: false, // true in environment.ts
firebase: {
apiKey: 'YOUR_API_KEY',
authDomain: 'YOUR_PROJECT.firebaseapp.com',
projectId: 'YOUR_PROJECT_ID',
storageBucket: 'YOUR_PROJECT.appspot.com',
messagingSenderId: 'YOUR_SENDER_ID',
appId: 'YOUR_APP_ID',
},
};
\`\`\`

### 3. Hugging Face token

1. Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — when creating it, choose the **Inference** permission preset (not Read-Only)
2. Create `src/environments/huggingface.secret.ts` (this file is gitignored — you must create it yourself, it will not exist after cloning):

\`\`\`typescript
export const HUGGINGFACE_TOKEN = 'hf_your_token_here';
\`\`\`

### 4. Run it

\`\`\`bash
ng serve
\`\`\`

Visit `http://localhost:4200`.

## Project structure

\`\`\`
decode/
├── src/app/
│ ├── core/ # Services: auth, auth/guest guards, firebase config, hugging face, history, settings, theme
│ ├── pages/ # One folder per route: landing, login, register, workspace, settings, profile, privacy, terms, brand
│ └── shared/
│ └── app-shell/ # Shared sidebar layout for workspace/settings/profile
├── src/environments/ # Firebase config + gitignored huggingface.secret.ts (see Setup)
└── src/styles.scss # Global design tokens (colors, fonts, theme variables)
\`\`\`

## Routing

`/workspace`, `/settings`, and `/profile` require a signed-in user (`authGuard`). `/login` and `/register` redirect away if you're already signed in (`guestGuard`). `/`, `/privacy`, `/terms`, and `/brand` are open to everyone.

## Known limitations (by design, for a conference demo)

- Code input is capped at 3,000 characters to stay within the model's token budget
- No Cloud Functions / server-side proxy — API keys are visible in the shipped JS bundle, same exposure any client-only app has. Fine for a low-stakes demo; not how you'd ship this to real users (see the talk for why that matters and what the paid-tier fix looks like)

## Talk

**"From Idea to MVP: Building AI-Powered Angular Apps with Firebase"** — NG Kenya 2026, 40-minute session.

## License

MIT
