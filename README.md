# AI Chat Web Portal

A web-based AI Chat portal built with **TypeScript**, **React**, **Next.js**, **Node** (API routes), and **MongoDB**. It provides secure login (email/password, magic link, OAuth), full chat history, file and audio input, and OpenAI-powered replies.

## Features

- **Authentication**: Email + password, magic link (email), OAuth (Google, Apple, GitHub)
- **Session**: JWT sessions with configurable max age and refresh
- **Chat**: Sidebar with conversation list, message thread, text input, file attachments, and voice messages
- **AI**: OpenAI Chat Completions for replies; Whisper for audio transcription
- **History**: Load and switch between conversations; create new threads from the sidebar
- **Profile**: Edit profile (name, image, phone, birthday), change password, delete account
- **Files**: Upload images/documents in chat; stored files served via `/api/files/[id]`

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **NextAuth.js** (credentials, email magic link, OAuth) + custom MongoDB adapter for verification tokens
- **MongoDB** + **Mongoose** (User, Conversation, Message, VerificationToken, StoredFile)
- **TanStack Query**, **Tailwind CSS**, **OpenAI API**

## Getting Started

### 1. Install dependencies

```bash
cd ai-chat-portal
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` or `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:4000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret (e.g. `openssl rand -base64 32`) |
| `SMTP_HOST` | For magic link | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | For magic link | SMTP port (e.g. `587`) |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | For magic link | SMTP credentials |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | For magic link | Sender address and name |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google | Google OAuth credentials |
| `APPLE_ID` / `APPLE_SECRET` | For Apple | Apple Sign In (JWT secret for APPLE_SECRET) |
| `GITHUB_ID` / `GITHUB_SECRET` | For GitHub | GitHub OAuth (if added to auth config) |
| `OPENAI_API_KEY` | For AI replies | OpenAI API key |
| `OPENAI_CHAT_MODEL` | Optional | Model name (defaults to `gpt-4o-mini` or similar) |

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000). You’ll be redirected to login. Register with email/password, use magic link (if SMTP is set), or sign in with Google/Apple if configured.

**Windows:** If you see `EBUSY` or file-lock errors with Turbopack, use:

```bash
npm run dev:webpack
```

### 4. First use

- **Register** with email + password, or request a **magic link**, or use **Google** / **Apple** if configured.
- After sign-in you land on `/chat`. Use **New** in the sidebar to create a conversation. Type a message, attach files, or record audio (if OpenAI key is set) to get AI replies.

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth, register
│   │   ├── conversations/  # CRUD, messages, audio
│   │   ├── files/          # Serve stored files
│   │   └── user/           # Profile, change-password, delete account
│   ├── chat/               # Chat UI
│   ├── login/              # Login, verify (magic link)
│   ├── profile/            # Edit profile
│   └── register/           # Registration
├── components/             # UI (Sidebar, MessageList, ChatInput, modals, etc.)
├── lib/                    # DB, auth, NextAuth adapter, models
└── types/                  # next-auth.d.ts
```

## API overview

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth (session, signin, callbacks) |
| `/api/auth/register` | POST | Register with email/password |
| `/api/conversations` | GET, POST | List conversations, create one |
| `/api/conversations/[id]` | GET, PATCH, DELETE | Get/update/delete conversation |
| `/api/conversations/[id]/messages` | GET, POST | List messages, send message (text or FormData with files) |
| `/api/conversations/[id]/audio` | POST | Send audio; transcribe with Whisper, then GPT reply |
| `/api/files/[id]` | GET | Serve stored file (auth; same conversation) |
| `/api/user/profile` | GET, PATCH | Get/update profile |
| `/api/user/change-password` | POST | Change password |
| `/api/user` | DELETE | Delete account |

All conversation, message, file, and user routes require an authenticated session.

## Real-time sync

Conversations and messages are refetched on interval so multiple tabs see updates. For true real-time sync with a mobile app, add WebSockets or a service like Pusher/Ably and keep the same MongoDB models and API shape.

## Design

UI follows a responsive chat layout (sidebar, thread, input) and can be refined to match the designs in `requirements.md`.
