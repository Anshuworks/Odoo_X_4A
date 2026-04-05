-- Remove the existing global unique constraint on email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;

-- Add the new composite unique constraint on email and company_id
ALTER TABLE users ADD CONSTRAINT users_email_company_id_key UNIQUE (email, company_id);
