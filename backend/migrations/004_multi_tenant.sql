ALTER TABLE companies ADD COLUMN invite_code VARCHAR(50);
UPDATE companies SET invite_code = substring(md5(random()::text) from 1 for 8) WHERE invite_code IS NULL;
ALTER TABLE companies ADD CONSTRAINT companies_invite_code_unique UNIQUE (invite_code);
