# Smart Waste Collection Bot — Console

Monitoring web app for the SWCB fleet: React + Tailwind frontend, Node/Express
backend, Firebase Realtime Database, Firebase Authentication, Firebase Cloud
Messaging for push alerts, and Recharts for analytics.

```
swcb-project/
  frontend/   React app (Vite) — dashboard, alerts, analytics, bot info
  backend/    Express API — alert engine + bot simulator + FCM push
```

The backend owns the alert logic (battery, waste, offline, obstacle, route
deviation) and writes results to Firebase. The frontend just reads Firebase
live and calls the backend for actions (mark emptied, acknowledge, register
for push). Until real hardware is connected, the backend also runs a
simulator that fabricates realistic bot telemetry so the whole app works
end-to-end today.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → follow the wizard.
2. In the project, go to **Build → Realtime Database** → **Create database** → start in test mode (tighten rules before going to production).
3. Go to **Build → Authentication** → **Sign-in method** → enable **Email/Password**.
4. Go to **Build → Authentication → Users** → **Add user** → create yourself an account to log in with.
5. Go to **Project settings (gear icon) → General** → under "Your apps" click the **</>** (Web) icon → register an app (no hosting needed) → copy the `firebaseConfig` values.
6. Go to **Project settings → Cloud Messaging** → under "Web configuration" generate a **Web Push certificate (VAPID key)** → copy it.
7. Go to **Project settings → Service accounts** → **Generate new private key** → this downloads a JSON file. Save it as `backend/serviceAccountKey.json`.

## 2. Configure environment variables

**Frontend:**
```
cd frontend
cp .env.example .env
```
Fill in `.env` with the `firebaseConfig` values from step 1.5 and the VAPID key from step 1.6.

**Backend:**
```
cd backend
cp .env.example .env
```
Set `FIREBASE_DATABASE_URL` (shown on the Realtime Database page, looks like
`https://your-project-default-rtdb.firebaseio.com`) and confirm
`FIREBASE_SERVICE_ACCOUNT_PATH` points at the JSON key you saved in step 1.7.

## 3. Install dependencies

```
cd backend && npm install
cd ../frontend && npm install
```

## 4. Run it

Open two terminals.

**Terminal 1 — backend:**
```
cd backend
npm run dev
```
This starts the API on http://localhost:4000, seeds a simulated fleet of
3–4 bots per sector into Firebase (first run only), and starts the alert
engine watching for threshold breaches.

**Terminal 2 — frontend:**
```
cd frontend
npm run dev
```
Open the printed URL (usually http://localhost:5173). Sign in with the
Firebase user you created in step 1.4.

## 5. Going from simulated to real bots

The simulator (`backend/services/simulator.js`) writes to the same
`/bots/{id}` structure real hardware should write to:
```
{ id, sector, battery, waste, distance, connected, speed, x, y }
```
Once your Arduino/ESP32 firmware is pushing readings to that same path in
Firebase, set `RUN_SIMULATOR=false` in `backend/.env` and everything else —
alerts, dashboard, analytics — keeps working unchanged.

## Notes

- **Mark emptied**: waste alerts don't auto-clear. An operator must click
  "Mark emptied" (on the bot card or in Alerts) once the container is
  physically emptied — this calls `POST /api/bots/:id/empty`.
- **Sectors**: the dashboard's sector dropdown is derived live from whatever
  sectors exist in `/bots` — add more sectors by seeding bots with a new
  `sector` value.
- **Push notifications**: critical alerts (low battery, offline) trigger an
  FCM push to any registered browser. Notification permission is requested
  automatically after login.
