Product Requirements Document: ENK Pilot
Project Status: Initial Build (2026)

Platform: Web / Mobile Web (Next.js 15)

Architecture: Solo-Developer / Privacy-First

1. Executive Summary
ENK Pilot is a lightweight financial co-pilot for Norwegian sole proprietors (enkeltpersonforetak). It bridges the gap between earning money and the "tax anxiety" of high-compliance Norwegian regulations. It is not a full accounting system but a "pre-accounting" tool for tax allocation and receipt triage.

2. Technical Stack
Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui.

Backend: Supabase (Auth, Postgres, Storage, Edge Functions).

Payments: Stripe (One-time Pro payment).

OCR: Tesseract.js (Client-side) for receipts.

AI Engine: Gemini 3.0 API (via Supabase Edge Functions) for Tax PDF parsing.

Analytics: PostHog (Privacy-friendly).

3. Core Feature Requirements
3.1. The "Safe-to-Spend" Calculator
Input: Gross income amount.

Calculation Logic:

MVA: If user is "MVA Registered," subtract 20% (standard 25% rate) from gross.

Tax: Apply the user's custom tax rate (extracted from PDF).

National Insurance: Calculate the ~11.0% trygdeavgift.

Output: Three distinct visual cards: "Tax Reserve," "MVA Reserve," and "Profit (Safe to Spend)."

3.2. Privacy-First Tax PDF Sync
Workflow: User uploads Skatteetaten PDF.

Processing: PDF text is extracted. AI identifies forventet_overskudd and skatteprosent.

Privacy: The PDF is never stored. Only the extracted numbers are saved to the user's profile.

3.3. Deadline Tracker
Deadlines: * MVA: Jan 10, Mar 10, May 10, July 10, Sept 10, Nov 10.

Forskuddsskatt: Mar 15, May 15, Sept 15, Nov 15.

Status: Interactive checkboxes to "Mark as Paid/Submitted."

4. Supabase SQL Schema
Copy and paste this into your Supabase SQL Editor to set up your database with Row Level Security (RLS) enabled.

SQL

-- 1. PROFILE TABLE (Extension of Auth.Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  is_mva_registered BOOLEAN DEFAULT false,
  tax_rate_percent DECIMAL(5,2) DEFAULT 35.00,
  is_pro BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'NOK'
);

-- 2. ALLOCATIONS (The "Safe-to-Spend" History)
CREATE TABLE allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  gross_amount DECIMAL(12,2) NOT NULL,
  tax_reserved DECIMAL(12,2) NOT NULL,
  mva_reserved DECIMAL(12,2) NOT NULL,
  net_profit DECIMAL(12,2) NOT NULL,
  note TEXT
);

-- 3. RECEIPTS (Metadata only, files go to Storage)
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  storage_path TEXT NOT NULL,
  vendor TEXT,
  amount DECIMAL(12,2),
  category TEXT, -- e.g., 'Office', 'Travel', 'Food'
  is_processed BOOLEAN DEFAULT false
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES (Users can only see THEIR data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own allocations" ON allocations 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own receipts" ON receipts 
  FOR ALL USING (auth.uid() = user_id);

-- 6. TRIGGER FOR NEW USER CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
5. Deployment & Cost Strategy
Staging: Vercel Preview Deployments.

Production: Vercel (Hobby Tier: $0).

Database: Supabase (Free Tier: $0).

AI: Gemini API (Free tier/Pay-as-you-go: ~$1/month for hobby volume).

Total Expected Cost: $0 for the first 50 users.