# Mediator Deployment Guide

This guide covers deploying Mediator for the remote V0 demo.

## Architecture Overview

- **Frontend**: Next.js 16 on Vercel
- **Backend**: Socket.io server on Render/Railway
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Voice Transcription**: Deepgram (or AssemblyAI for speaker diarization)

---

## Prerequisites

1. **Accounts needed**:
   - [Vercel](https://vercel.com) - Frontend hosting
   - [Render](https://render.com) or [Railway](https://railway.app) - Backend hosting
   - [Supabase](https://supabase.com) - Database
   - [Resend](https://resend.com) - Email service
   - [Deepgram](https://deepgram.com) - Voice transcription (optional)
   - [AssemblyAI](https://assemblyai.com) - Speaker diarization (optional)

2. **Domain** (optional but recommended):
   - Custom domain for professional demo URLs

---

## Step 1: Set Up Supabase

### 1.1 Create Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region (pick closest to your users)
4. Set a strong database password

### 1.2 Run Database Schema
1. Go to **SQL Editor** in your Supabase project
2. Copy contents of `supabase/schema.sql`
3. Run the SQL to create tables

### 1.3 Get API Keys
Navigate to **Settings → API** and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 1.4 Enable Scheduled Cleanup (Optional)
To auto-delete transcripts after 24 hours:
1. Go to **Database → Extensions**
2. Enable `pg_cron`
3. Run in SQL Editor:
```sql
SELECT cron.schedule('cleanup-transcripts', '0 * * * *', 'SELECT cleanup_expired_transcripts()');
```

---

## Step 2: Set Up Resend (Email)

### 2.1 Create Account
1. Go to [Resend](https://resend.com) and sign up
2. Verify your domain (or use their test domain for demo)

### 2.2 Get API Key
1. Go to **API Keys**
2. Create a new key
3. Copy → `RESEND_API_KEY`

### 2.3 Configure Sender
Set `EMAIL_FROM` to your verified domain:
```
EMAIL_FROM=Mediator <notifications@yourdomain.com>
```

Or for testing:
```
EMAIL_FROM=Mediator <onboarding@resend.dev>
```

---

## Step 3: Deploy Socket.io Backend

### Option A: Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `mediator-socket`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or Starter for production)

5. Add Environment Variables:
   ```
   SOCKET_PORT=3001
   CORS_ORIGINS=https://your-vercel-domain.vercel.app
   REDIS_URL=<optional - for persistence across restarts>
   ```

6. Deploy and copy the URL (e.g., `https://mediator-socket.onrender.com`)

### Option B: Railway

1. Go to [Railway](https://railway.app)
2. Click **New Project → Deploy from GitHub**
3. Select your repo
4. Add a new service for the socket server
5. Configure environment variables same as Render
6. Deploy and get the URL

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your GitHub repository

### 4.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 4.3 Set Environment Variables
Add these in Vercel's project settings:

```bash
# Socket.io Server (from Step 3)
NEXT_PUBLIC_SOCKET_URL=https://mediator-socket.onrender.com

# Supabase (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Email (from Step 2)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Mediator <notifications@yourdomain.com>

# AI Features (optional)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Voice Transcription (optional)
DEEPGRAM_API_KEY=xxxxx
ASSEMBLYAI_API_KEY=xxxxx
```

### 4.4 Deploy
Click **Deploy** and wait for build to complete.

---

## Step 5: Update CORS Settings

After deployment, update CORS in your socket server:

1. Go to Render/Railway dashboard
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
   ```
3. Redeploy the service

---

## Step 6: Test the Demo Flow

### Pre-flight Checklist
- [ ] Frontend loads at Vercel URL
- [ ] Socket connection establishes (check browser console)
- [ ] Can create/join sessions
- [ ] Voice recording works (Deepgram)
- [ ] Session analytics save to Supabase
- [ ] Email reports send successfully
- [ ] Admin dashboard shows sessions

### Demo Flow Test
1. Open `/demo` page
2. Enter access code: `MEDIATOR2025`
3. Accept privacy consent
4. Grant microphone permission
5. Select "Technical to Non-Technical Team Meeting" template
6. Complete 3 rounds (voice or text)
7. View live summary panel
8. Complete session
9. Send email report
10. Check admin dashboard

---

## Environment Variables Reference

```bash
# Required
NEXT_PUBLIC_SOCKET_URL=           # Socket.io server URL
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key

# Email (Required for reports)
RESEND_API_KEY=                   # Resend API key
EMAIL_FROM=                       # Sender email address

# AI Features (Optional but recommended)
ANTHROPIC_API_KEY=                # Claude API for summaries

# Voice (Optional)
DEEPGRAM_API_KEY=                 # Real-time transcription
ASSEMBLYAI_API_KEY=               # Speaker diarization

# Backend (Set on socket server)
SOCKET_PORT=3001
CORS_ORIGINS=                     # Comma-separated allowed origins
REDIS_URL=                        # Optional - session persistence
SUPABASE_SERVICE_ROLE_KEY=        # For server-side DB operations
```

---

## Customizing the Demo

### Change Access Code
Edit `src/app/demo/page.tsx`:
```typescript
const DEMO_ACCESS_CODE = 'YOUR_NEW_CODE';
```

### Add Custom Templates
Edit `src/lib/dbtSkills.ts` to add new skill-based templates.

### Modify Email Template
Edit `src/app/api/email/send-report/route.ts` to customize email design.

---

## Troubleshooting

### Socket Connection Fails
- Check CORS_ORIGINS includes your frontend domain
- Verify NEXT_PUBLIC_SOCKET_URL is correct
- Check socket server logs on Render/Railway

### Email Not Sending
- Verify Resend API key is valid
- Check domain is verified in Resend dashboard
- Check server logs for error details

### Database Errors
- Verify Supabase credentials
- Check RLS policies allow inserts
- Run schema.sql if tables don't exist

### Voice Not Working
- Ensure HTTPS (required for microphone access)
- Check Deepgram API key is valid
- Test with text input first

---

## Production Checklist

Before going live:

- [ ] Use custom domain with HTTPS
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure rate limiting on socket server
- [ ] Review RLS policies in Supabase
- [ ] Set up database backups
- [ ] Test email deliverability
- [ ] Update privacy policy and terms
- [ ] Remove demo access code or make it private

---

## Support

For issues or questions:
- Check logs in Vercel/Render/Supabase dashboards
- Review browser console for client-side errors
- Test API endpoints directly with curl/Postman
