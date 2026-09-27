# wellquest

Hackathon prototype for a healthy-aging app focused on UBC and West Point Grey.

The app includes onboarding, activity discovery, quests, bookings, profiles, and a local demo mode. Supabase is the shared backend for real accounts and data.

The name is a placeholder and can change later.

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/202609260001_wellquest_core.sql`](supabase/migrations/202609260001_wellquest_core.sql). It creates profile, quest, and booking tables, row-level access rules, booking functions, avatar storage, and the seeded community quests.
3. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key from the Supabase project settings. Never put a `service_role` key in the browser app.
4. Add your local and deployed app URLs under Supabase Auth's allowed redirect URLs. Email confirmation is supported; for a quick hackathon demo, you can disable confirmation in the Auth provider settings.
5. Restart `npm run dev` after editing `.env.local`.

Without Supabase credentials, the app keeps working in local demo mode. The demo profile and its bookings stay in that browser. With Supabase configured, seeded quests are shared with real accounts; their seeded attendance is a baseline, and real user bookings add to and subtract from the shared count.
