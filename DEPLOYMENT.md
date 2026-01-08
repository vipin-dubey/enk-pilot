# Deployment Guide for ENK Pilot

## Prerequisites
- Vercel account
- Domain `enkpilot.com` configured in your domain registrar
- Supabase project URL and anon key

## Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: enk-pilot
# - Deploy
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project settings (auto-detected for Next.js)
4. Deploy

## Step 2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

**Important:** Do NOT add `NODE_TLS_REJECT_UNAUTHORIZED` in production!

## Step 3: Configure Custom Domains

In Vercel Dashboard → Project Settings → Domains:

1. **Add main domain:**
   - Domain: `enkpilot.com`
   - Click "Add"

2. **Add app subdomain:**
   - Domain: `app.enkpilot.com`
   - Click "Add"

3. **Configure DNS** (in your domain registrar):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

## Step 4: Update Supabase Auth Settings

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL:** `https://enkpilot.com`
2. **Redirect URLs:** Add these:
   - `https://enkpilot.com/auth/callback`
   - `https://app.enkpilot.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

## Step 5: Test Production Deployment

1. Visit `https://enkpilot.com` - should show landing page
2. Click "Login" - should redirect to `https://app.enkpilot.com/login`
3. Log in - should land on dashboard at `https://app.enkpilot.com`
4. Session should persist across subdomains

## Troubleshooting

### Cookies not persisting across subdomains
- Verify DNS is correctly pointing both domains to Vercel
- Check that both domains show in Vercel dashboard
- Ensure `domain: '.enkpilot.com'` is set in middleware (already configured)

### Build fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript errors are resolved

### Authentication redirects fail
- Verify Supabase redirect URLs include both domains
- Check that environment variables are set correctly
- Ensure Supabase project is not paused

## Next Steps After Deployment

1. Test all authentication flows (login, signup, MFA, logout)
2. Verify subdomain routing works correctly
3. Test on mobile devices
4. Set up Vercel Analytics (optional)
5. Configure custom error pages (optional)
