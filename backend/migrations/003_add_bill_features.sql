-- Add currency and receipt features to bills table
ALTER TABLE bills 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS converted_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS scanned_data JSONB;
