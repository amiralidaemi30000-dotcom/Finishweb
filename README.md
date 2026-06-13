<div align="center">

# HAMIK · هامیک

**A private, beautiful messenger for the global Iranian community.**
Built with real fire — in Finland, for every Iranian.

</div>

---

HAMIK is a real-time chat app: dark, glassmorphic, fully RTL, bilingual (فارسی + English),
mobile-first. It runs on a live Supabase backend with Postgres Row-Level Security, realtime
subscriptions, and email/password auth.

## ✨ Features

- **Real auth** — email + password via Supabase Auth.
- **Live chat** — messages stream in over Supabase Realtime, no refresh.
- **Chat list** — your conversations, newest first, with live previews.
- **Start a conversation** — search people by name/username and message them.
- **Profile** — edit display name, username, and bio.
- **RTL-first** — Persian (Vazirmatn) and English (Inter), correct bidi everywhere.
- **Optimistic sending** — bubbles appear instantly, reconcile on save.
- **Security** — every table is guarded by RLS; clients only ever see their own data.

## 🎨 Design

| | |
|---|---|
| Background | `#0A0E1A` deep navy |
| Primary | `#4F8EF7` electric blue |
| Accent | `#F0B429` gold |
| Text | `#FFFFFF` |

Glassmorphism surfaces, aurora glows, floating particles, spring animations (Framer Motion).
Hero imagery generated with Higgsfield.

## 🧱 Stack

- **React 18** + **Vite** + **React Router**
- **Tailwind CSS** (custom glass utilities + brand tokens)
- **Framer Motion** for transitions
- **Supabase** — Postgres, Auth, Realtime, RLS
- **lucide-react** icons

## 🗄️ Data model

```
profiles( id → auth.users, username, display_name, avatar_url, bio, last_seen )
conversations( id, is_group, title, created_by, updated_at )
conversation_participants( conversation_id, user_id )
messages( id, conversation_id, sender_id, content, created_at )
```

Helpers: `is_conversation_participant()` (SECURITY DEFINER, avoids RLS recursion),
`get_or_create_direct_conversation()` RPC, auto-profile-on-signup trigger,
`updated_at` bump on new message. Realtime enabled on `messages` + `conversations`.

## 🚀 Run it

```bash
npm install
npm run dev
```

The app ships with working public Supabase credentials baked in, so it runs with **zero setup**.
To point at your own project, copy `.env.example` → `.env` and edit the values.

```bash
npm run build      # production build
npm run preview    # serve the build
```

## 👋 Try it instantly

Sign up with any email, or log in with a seeded demo account:

| Email | Password |
|---|---|
| `darya@hamik.app` | `hamik1234` |
| `arash@hamik.app` | `hamik1234` |
| `sara@hamik.app`  | `hamik1234` |

> Open two browser windows, log in as two different users, and watch messages appear live.

## 🔐 Note on email confirmation

New sign-ups work immediately if "Confirm email" is **off** in your Supabase Auth settings
(Dashboard → Authentication → Providers → Email). The seeded demo accounts above are
pre-confirmed, so they always log in. The login screen handles both cases gracefully.

---

<div align="center">
Made with ❤️ for the Iranian diaspora.
</div>
