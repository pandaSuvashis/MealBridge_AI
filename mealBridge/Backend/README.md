# MealBridge AI backend

Express + TypeScript + MongoDB Atlas API for the MealBridge AI frontend. Supabase Auth access tokens are verified for every `/api/*` route except `/api/health`. Application participants and donations remain in MongoDB.

## Setup

1. In this `Backend` folder, copy `.env.example` to `.env` and fill in `MONGODB_URI` with your Atlas database connection string and `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` with the existing Supabase project values. Never commit this file.
2. In Atlas, create a database user, add your current IP address under **Network Access**, and use a URI whose database name is `mealbridge` (or any name you prefer).
3. Set `FRONTEND_URL` to the exact Next.js origin (normally `http://localhost:3000`).
4. Run:

```bash
npm install
npm run seed
npm run dev
```

The server will not start with a missing or unreachable MongoDB database; it does not fall back to fake in-memory data.

`GET /api/health` remains public for health checks. All other API endpoints require `Authorization: Bearer <Supabase access token>`; the API validates it with Supabase Auth and does not accept identity or role claims from request bodies.

New authenticated accounts receive a MongoDB donor profile only when they first create a donation. The donor identity is bound to the verified Supabase user ID. NGO and volunteer actions require an existing participant record linked to that Supabase user ID through `supabaseUserId`; users cannot self-assign those roles. Link and approve those records through a trusted administrative process before enabling collector operations. No Supabase profile table or RLS policy was found in this repository, so this implementation does not create or modify Supabase database tables or policies.

The MongoDB `User.supabaseUserId` field has a sparse unique index. Existing participant records can be linked by setting this field to the corresponding Supabase Auth user UUID through a trusted database operation. Do not expose a client-editable role/profile endpoint.

## API contract

All responses are JSON: `{ "success": true, "data": ... }`. Errors are `{ "success": false, "error": { "code", "message" } }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server and MongoDB connection status |
| GET | `/api/donations?status=&urgency=&search=` | List donations; `urgency` is `urgent`, `normal`, or `expired` |
| POST | `/api/donations` | Create a donation from the frontend form payload |
| GET | `/api/donations/:id` | Get a donation |
| PATCH | `/api/donations/:id` | Edit an **available** donation; status cannot be patched |
| GET | `/api/donations/:id/matches` | Deterministic capacity/readiness/distance recommendations |
| POST | `/api/donations/:id/claim` | Claim atomically using the authenticated, linked collector profile |
| POST | `/api/donations/:id/verify-pickup` | Body: `{ "pickupCode": "MB-1234" }`; claimed → collected |
| POST | `/api/donations/:id/complete` | Collected → delivered |
| GET | `/api/impact` | Persisted impact metrics; only delivered food counts |
| GET | `/api/impact/activity?limit=20` | Recent delivered donations |
| GET | `/api/participants` | Active NGO and volunteer recipients for matching |

The primary frontend collection flow is direct donor contact: new donation submissions require a donor phone number, and authenticated users can use the `tel:` link to call and arrange pickup. Calling does **not** reserve food or change its status; confirm availability and pickup details with the donor. Authenticated donation responses include `donorPhone`; older records without one return an empty value and cannot be called from the app. The legacy collector claim endpoints below remain available only for the existing authorized handover flow.

`POST /api/donations` accepts the existing frontend field names:

```json
{
  "foodName": "Vegetable Pulao",
  "category": "Prepared Meals",
  "quantityKg": 12,
  "donorName": "IIIT Bakul Central Mess",
  "donorPhone": "+919876543210",
  "donorType": "Campus Mess",
  "pickupLocation": "Dispatch Dock",
  "locationArea": "IIIT Campus",
  "preparationTime": "2026-10-10T12:00:00.000Z",
  "pickupDeadline": "2026-10-10T15:00:00.000Z",
  "foodNotes": "Packed in sealed food-grade containers"
}
```

Donation responses use the frontend's `id`, `foodName`, `category`, `quantityKg`, `foodNotes`, `claimedBy`, `collectedAt`, `deliveredAt`, and status names. Pickup codes are never included in public list/detail responses. The claim response is the sole demo response that returns `{ data: { donation, pickupCode } }`; retain it only for the authorized handover flow.

Lifecycle: `available → claimed → collected → delivered`. A past deadline changes an available donation to `expired`; claims use a single conditional MongoDB update so simultaneous claim attempts yield one success and one `409 DONATION_UNAVAILABLE`.

## Frontend connection

Add `NEXT_PUBLIC_API_URL=http://localhost:5000/api` to `frontend/.env.local`. Replace the actions in `frontend/src/lib/demo-store.tsx` incrementally:

1. On initial load, fetch `GET ${NEXT_PUBLIC_API_URL}/donations` and `GET .../impact` rather than reading localStorage.
2. POST the existing `NewDonationInput` directly to `/donations`; response data already matches `Donation` except the frontend's local-only `pickupCode` field.
3. Replace `claimDonation(id, recipientId)` with `POST /donations/:id/claim` and save the returned `pickupCode` only in the active authorized pickup view.
4. Send the entered pass to `/donations/:id/verify-pickup`, then call `/donations/:id/complete`.
5. Treat `409` as a refresh-and-notify conflict, and show 400 error messages beside form fields/actions.

The frontend is intentionally unmodified so it remains usable while Atlas is being configured.

## Checks

```bash
npm run build
npm test
```

The included unit tests exercise deadline logic, matching/capacity eligibility, pickup-code hashing and invalid-code rejection, and allowed lifecycle transitions. Database endpoint testing requires a configured Atlas URI.
