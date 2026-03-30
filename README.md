# Jade Royale

Jade Royale is a Next.js e-commerce website with:

- Email/password login
- Google OAuth login/signup
- OTP email verification for manual signup
- Admin dashboard for product management

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Create or update `.env.local` in the project root.

Use this template:

```env
MONGODB_URI=your_mongodb_connection_string
IMGBB_API_KEY=your_imgbb_api_key

ADMIN_PANEL_USERNAME=admin
ADMIN_PANEL_PASSWORD=admin123
ADMIN_PANEL_TOKEN=replace_with_a_random_token

NEXTAUTH_SECRET=replace_with_a_long_random_secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=replace_with_smtp_user
SMTP_PASS=replace_with_smtp_password
SMTP_FROM="Jade Royale <no-reply@jaderoyale.com>"
```

## 3. Google OAuth Setup

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a project (or select existing).
3. Open API & Services > OAuth consent screen.
4. Configure consent screen (External/Internal), app name, support email, and authorized domains.
5. Open API & Services > Credentials > Create Credentials > OAuth client ID.
6. Choose Application type: Web application.
7. Add Authorized JavaScript origins:
   - `http://localhost:3000`
8. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
9. Copy Client ID and Client Secret into:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

For production, also add your production domain to origins and callback URL.

## 4. SMTP Setup (OTP Email)

Manual signup sends a 6-digit OTP to user email.

Required SMTP variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

If using Gmail, use an App Password (not your normal Gmail password).

## 5. Run the App

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## 6. Auth Routes and Pages

- Login page: `/login`
- Signup page: `/signup`
- NextAuth route: `/api/auth/[...nextauth]`
- Request OTP route: `/api/auth/signup/request-otp`
- Verify OTP route: `/api/auth/signup/verify-otp`

## 7. Test Checklist

1. Manual signup:
   - Open `/signup`
   - Submit name/email/password
   - Receive OTP by email
   - Verify OTP
   - Account is created and user is logged in
2. Manual login:
   - Open `/login`
   - Login with same email/password
3. Google login/signup:
   - Click Continue with Google
   - Complete Google consent
   - User is logged in

## 8. Build Check

```bash
npm run build
```

If build passes, your OAuth and OTP setup is correctly wired.
