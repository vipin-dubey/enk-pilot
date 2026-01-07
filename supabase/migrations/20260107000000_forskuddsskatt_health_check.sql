-- Add health check fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estimated_annual_profit NUMERIC(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_prepaid_tax_amount NUMERIC(12,2) DEFAULT 0;
