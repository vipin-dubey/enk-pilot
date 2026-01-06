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


1. Expanded Tax Buffer
Executive SummaryThe Tax Buffer Engine is the core intelligence of the app. It calculates exactly how much a user should set aside from every incoming payment based on their Year-to-Date (YTD) profit, 2026 tax brackets, and MVA status. Unlike a static calculator, it accounts for Marginal Tax Rate shifts as income grows throughout the year.2. 2026 Tax Constants & BracketsThe following rates are codified for the 2026 fiscal year in Norway:2.1 Fixed RatesOrdinary Income Tax (Alminnelig inntekt): 22.0%National Insurance (Trygdeavgift - High Rate for ENK): 10.8%Standard MVA (VAT): 25.0%Personal Allowance (Personfradrag): 114,210 NOK (The amount of "Alminnelig inntekt" that is tax-free).2.2 Trinnskatt (Bracket Tax) 2026Calculated on Gross Personal Income (before deductions):| Bracket | Income Range (NOK) | Rate || :--- | :--- | :--- || Level 0 | 0 – 226,100 | 0.0% || Level 1 | 226,101 – 318,300 | 1.7% || Level 2 | 318,301 – 725,050 | 4.0% || Level 3 | 725,051 – 980,100 | 13.7% || Level 4 | 980,101 – 1,467,200 | 16.8% || Level 5 | 1,467,201 and above | 17.8% |3. Database Schema Requirements (Supabase)Table: profilesytd_gross_income: numeric (Sum of all income excluding MVA).ytd_expenses: numeric (Sum of all deductible business costs).external_salary_income: numeric (User's salary from other jobs, used for bracket calculation).is_mva_registered: boolean.Table: allocationstransaction_id: uuid.gross_received: numeric (The actual amount that hit the bank).mva_reserved: numeric.tax_reserved: numeric.safe_to_spend: numeric.marginal_rate_applied: numeric (e.g., 0.368).4. The "Master Algorithm" LogicWhen a user enters a new payment amount ($X$), the system must execute the following logic in sequence:Step 1: MVA SeparationCheck if the user is is_mva_registered.If Yes:$MVA\_Part = X - (X / 1.25)$$Net\_Revenue = X / 1.25$If No:$MVA\_Part = 0$$Net\_Revenue = X$Step 2: Calculate Current Profit ContextDetermine where the user currently stands in the tax year:$Current\_Profit\_YTD = (ytd\_gross\_income + external\_salary\_income) - ytd\_expenses$Step 3: Incremental Bracket CalculationThe engine must determine the Marginal Rate for the next NOK earned.Base Rate: 22% (Ordinary) + 10.8% (Trygdeavgift) = 32.8%.Trinnskatt Rate: Based on where $Current\_Profit\_YTD$ falls in the brackets.Effective Rate: $32.8\% + Trinnskatt\%$.Complex Logic Alert: If a single transaction (e.g., 100,000 NOK) spans across two tax brackets, the engine must split the calculation: apply the lower bracket rate to the portion "filling" the current bracket, and the higher rate to the remainder.Step 4: Final AllocationTotal Tax Buffer = (Incremental Bracket Calculation)Total Reserved = $MVA\_Part + Total\ Tax\ Buffer$Safe to Spend = $X - Total\ Reserved$5. User Scenarios (Edge Cases)Scenario A: The 50k MVA ThresholdLogic: If is_mva_registered is false AND ytd_gross_income + $Net\_Revenue > 50,000$.Action: Flag for user: "This transaction crosses the 50,000 NOK threshold. You must apply for MVA registration immediately."Scenario B: Business ExpensesLogic: When an expense is added, the system updates the ytd_expenses.UI Feedback: Show the user how much their "Tax Debt" decreased. (e.g., "Buying this laptop saved you 4,200 NOK in future tax").Scenario C: External SalaryLogic: If a user has a part-time job earning 400,000 NOK, the ENK profit starts calculating Trinnskatt from Level 2 (4.0%) immediately, because the salary has already "used up" the lower brackets.6. Technical Implementation PromptsFor the Backend (Edge Function/Database):"Write a Postgres Trigger in Supabase that updates the profiles.ytd_gross_income every time a record is inserted into allocations. Ensure Row Level Security (RLS) is strictly enforced so users only calculate against their own data."For the Frontend (TypeScript Logic):"Create a TypeScript utility calculateNorwegianTax.ts. Input: amount, currentYTD, isMVA. Output: Object with mva, tax, safeAmount. It must loop through the 2026 Trinnskatt array and handle 'bracket jumping' if a large amount is entered."



Based on my analysis of the current state of ENK Pilot, we have built a very solid "pre-accounting" foundation. You have the Tax Engine tracking brackets, PDF Sync for context, Receipt OCR for deductions, and a Deadline Tracker.

However, looking at the real-world workflow of a Norwegian sole proprietor (ENK), there are three critical gaps that would move this application from "useful" to "indispensable":

1. Forskuddsskatt (Prepaid Tax) "Health Check"
We track the deadlines for prepaid tax, but we don't actually tell the user if they are paying enough.

The Problem: You might have told Skatteetaten you'd earn 500k, but by June you've already made 400k. You are headed for a massive tax bill next year.
The ENK Requirement: A feature that compares YTD Profit vs. Expected Profit (from the PDF) and warns you: "You're earning more than expected. We recommend increasing your prepaid tax by 5,000 NOK to avoid a back-tax penalty."
2. MVA Period Summaries (The "MVA Melding" Draft)
We reserve the MVA, which is great, but every 2 months (Jan-Feb, Mar-Apr, etc.), you have to log into Altinn and report it.

The Problem: Currently, you'd have to manually filter receipts and allocations to find the numbers for the Altinn form.
The ENK Requirement: A "MVA Report" view that groups your data by the 6 Norwegian MVA periods and shows exactly two numbers: Output MVA (from income) and Input MVA (from expenses). It would tell you: "For Period 1, you owe Skatteetaten 12,400 NOK. Here is the breakdown."
3. Smart Deduction Suggestions (The "Tax Benefit" UI)
Sole proprietors often miss out on valid deductions like the "Home Office" allowance or mileage.

The Problem: Users only think about deductions when they have a physical receipt.
The ENK Requirement: A "Deduction Optimizer" that asks: "Do you work from home?" and automatically adds the standard deduction (currently ~2,000 NOK) to the YTD expenses, showing the user exactly how much tax they just saved.
4. Technical Detail: Personal Allowance (Personfradrag)
Currently, our calculator applies the 22% Ordinary Tax to the entire profit. In reality, the first 114,210 NOK (for 2026) is tax-free "Ordinary Income."

Recommendation: We should update the 
calculateNorwegianTax
 logic to account for the Personal Allowance. This would make the "Safe to Spend" amount much more accurate and less "scary" for people just starting their year.
My Recommendation for the Next Step:
I would prioritize #4 (Personal Allowance accuracy) and then #2 (The MVA Period Summary). These two features directly impact the user's bank account and their bi-monthly regulatory stress.

Would you like me to start by making the Tax Engine smarter regarding the Personal Allowance?