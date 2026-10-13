# MealBridge frontend

Next.js App Router frontend for the MealBridge food rescue platform.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the existing Supabase project. Use only the publishable/anon key here; never put a service-role or Google client secret in frontend variables.
3. Keep `NEXT_PUBLIC_API_URL` pointed at the Express API (normally `http://localhost:5000/api`).
4. Run `npm install` and `npm run dev`.

## Authentication

- `/login` offers Google OAuth and passwordless email OTP on the same page. New email users are allowed to register by Supabase Auth.
- The callback endpoint is `/auth/callback`. Configure the Supabase Auth redirect allowlist with `http://localhost:3000/auth/callback` and the deployed equivalent.
- `signInWithOtp` requests a passwordless email code, but the Supabase dashboard email template determines whether the message contains a code or a magic link. In Supabase Dashboard → Authentication → Email Templates, edit the Magic Link template to include `{{ .Token }}` instead of relying on `{{ .ConfirmationURL }}`. If email confirmation is enabled for new users, update the Confirm signup template to show `{{ .Token }}` too. Example body: `Your MealBridge verification code is {{ .Token }}`. Set the email OTP length to 6 in the Supabase Auth email provider settings.
- Email sign-in requests set `emailRedirectTo` to `/auth/callback`, so a magic link from an unchanged template still returns through the session exchange callback. The six-digit code is verified on the login page.
- `proxy.ts` refreshes and validates the Supabase cookie session and protects dashboard routes. Sign-out is in the top navigation.
- The frontend sends the current Supabase access token as a Bearer token to the Express API.

The UI uses the existing MealBridge light/dark preference. No separate auth theme storage is introduced.

## Direct donor calls

New donations require an Indian donor phone number. Signed-in users can call the donor from an available-food card or the Call Donors page and arrange collection directly. This call does not reserve the food or change its status; confirm that it is still available and agree on pickup details with the donor. Older donations without a saved phone number remain visible but do not have a call action.
