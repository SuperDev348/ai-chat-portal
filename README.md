# AI Chat Web Portal

A web-based AI Chat portal built with **TypeScript**, **React**, **Next.js**, **Node** (API routes), and **MongoDB**. It provides secure login, full chat history, new threads, and synced state so the AI experience is consistent across desktop and mobile.

## Features

- **Secure authentication**: Email + password, magic link (email), and OAuth (Google, GitHub)
- **Session handling**: JWT sessions with configurable max age and refresh
- **Chat UI**: Sidebar with conversation list, message thread, and input
- **Full chat history**: Load and switch between existing conversations
- **New threads**: Create new chats from the sidebar
- **Sync-friendly**: Conversations and messages stored in MongoDB; refetch interval for near–real-time sync (can be replaced with WebSockets later)
- **Error handling**: Clear error states, retry, and session-expired flows

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **NextAuth.js** for auth (credentials, email magic link, OAuth)
- **MongoDB** + **Mongoose** for users, conversations, messages
- **TanStack Query** for data fetching and cache
- **Tailwind CSS** for styling

## Getting Started

### 1. Install dependencies

```bash
cd ai-chat-portal
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `MONGODB_URI` – MongoDB connection string
- `NEXTAUTH_URL` – e.g. `http://localhost:3000`
- `NEXTAUTH_SECRET` – random secret (e.g. `openssl rand -base64 32`)

Optional:

- **Magic link**: `EMAIL_SERVER`, `EMAIL_FROM`
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED=true`
- **GitHub OAuth**: `GITHUB_ID`, `GITHUB_SECRET`, `NEXT_PUBLIC_GITHUB_ENABLED=true`

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to login. Register with email/password or use magic link / OAuth if configured.

### 4. First user

- Go to **Register** and create an account (email + password).
- After sign-in you’ll land on `/chat`. Use **New** in the sidebar to create a conversation and send messages.

## Project structure

- `src/app/` – Next.js App Router pages and API routes
- `src/app/api/auth/` – NextAuth and register
- `src/app/api/conversations/` – List, create, get, update, delete conversations and messages
- `src/components/` – SessionProvider, Sidebar, MessageList, ChatInput, ErrorState, SessionExpired
- `src/lib/` – DB connection, auth config, Mongoose models (User, Conversation, Message, VerificationToken)

## API overview

- `GET/POST /api/conversations` – List conversations, create one
- `GET/PATCH/DELETE /api/conversations/[id]` – Get/update/delete a conversation
- `POST /api/conversations/[id]/messages` – Send a message
- `POST /api/auth/register` – Register with email/password

All conversation/message routes require an authenticated session (NextAuth).

## Real-time sync

Conversations and messages are refetched every few seconds so multiple tabs or devices see updates quickly. For true real-time sync with a mobile app, you can add WebSockets or a service like Pusher/Ably and keep the same MongoDB models and API shape.

## Design

UI follows a simple desktop chat layout (sidebar + thread + input) and can be refined to match the provided Adobe XD designs (Desktop / Mobile) in `requirements.md`.
