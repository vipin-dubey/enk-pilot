-- 1. PROFILE TABLE (Extension of Auth.Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  is_mva_registered BOOLEAN DEFAULT false,
  tax_rate_percent DECIMAL(5,2) DEFAULT 35.00,
  is_pro BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'NOK'
);

-- 2. ALLOCATIONS (The "Safe-to-Spend" History)
CREATE TABLE IF NOT EXISTS allocations (
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
CREATE TABLE IF NOT EXISTS receipts (
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
-- Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Allocations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own allocations') THEN
        CREATE POLICY "Users can manage own allocations" ON allocations 
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Receipts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own receipts') THEN
        CREATE POLICY "Users can manage own receipts" ON receipts 
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. TRIGGER FOR NEW USER CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;
