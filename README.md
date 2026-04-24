# ⚡ Quarq Web App

This repository contains the Next.js frontend and user dashboard for the Quarq Agent platform. It handles user authentication, profile setup, active tool integrations (OAuth), and the main web-based chat interface.

## 🏗️ Architecture

This app acts as the client-facing presentation layer, interfacing directly with **Supabase** (Database/Auth) and the **Quarq Agent API** (Backend).

*   **Framework:** Next.js (App Router)
*   **Styling:** Custom CSS / Tailwind
*   **Database & Auth:** Supabase (`@supabase/ssr`)
*   **Agent Connection:** Routes through secure `/api/message` backend handlers.

## 🗄️ Database Mapping
The frontend relies on the strict hierarchical schema defined in the `DevOPS_Architecture.md`.
*   `profiles` (Identity & Agent Persona config)
*   `channels` (Web, Telegram, etc.)
*   `conversations` & `messages` (Chat History)
*   `integrations` (Unified table for Google, Slack, etc. OAuth tokens)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file. The frontend **requires** the `NEXT_PUBLIC_` prefix to expose Supabase keys to the client.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend Agent Credentials (Required for the /api/message route)
AGENT_URL=http://your-agent-backend:8000/api
AGENT_INTERNAL_SECRET=your-secret-key
```

### 3. Run Development Server
```bash
npm run dev
```

## 🔒 Security Best Practices Implemented
*   **RLS-Compliant Flows:** User profile updates (like `display_name`) are synchronized *after* a successful login session is established to prevent Row Level Security blocking during email confirmation flows.
*   **Robust API Routes:** All POST/PATCH routes implement `try/catch` wrappers around JSON parsing to prevent unhandled 500 server crashes from malformed inputs.
*   **Encrypted Secrets:** External API tokens are never passed directly through the frontend; they are managed securely via the backend `integrations` table.
