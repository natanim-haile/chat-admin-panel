-- Migration: Refactor users table schema
-- This script will:
-- 1. Add first_name and last_name columns
-- 2. Migrate existing name data
-- 3. Rename avatar to profile_picture
-- 4. Remove status, last_active, and role columns

-- Step 1: Add new columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Step 2: Migrate existing name data (split name into first_name and last_name)
UPDATE public.users
SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
        THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE ''
    END
WHERE name IS NOT NULL;

-- Step 3: Copy avatar data to profile_picture
UPDATE public.users
SET profile_picture = avatar
WHERE avatar IS NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE public.users
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS avatar,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS last_active,
DROP COLUMN IF EXISTS role;

-- Step 5: Make first_name required (NOT NULL)
ALTER TABLE public.users
ALTER COLUMN first_name SET NOT NULL;

-- Verify the migration
SELECT id, first_name, last_name, email, profile_picture, created_at
FROM public.users
LIMIT 5;
