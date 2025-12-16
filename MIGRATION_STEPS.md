# Database Migration Instructions

## Execute this SQL in your Supabase SQL Editor

Go to your Supabase Dashboard → SQL Editor → New Query, then paste and run this:

```sql
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

-- Step 4: Verify the migration worked
SELECT id, first_name, last_name, email, profile_picture, created_at
FROM public.users
LIMIT 5;

-- Step 5: (OPTIONAL) Drop old columns after verifying everything works
-- Uncomment these lines only after confirming the migration worked:
-- ALTER TABLE public.users
-- DROP COLUMN IF EXISTS name,
-- DROP COLUMN IF EXISTS avatar,
-- DROP COLUMN IF EXISTS status,
-- DROP COLUMN IF EXISTS last_active,
-- DROP COLUMN IF EXISTS role;

-- Step 6: (OPTIONAL) Make first_name required
-- Uncomment after verifying:
-- ALTER TABLE public.users
-- ALTER COLUMN first_name SET NOT NULL;
```

## After running the SQL:

1. The code changes have been reverted to use `first_name`, `last_name`, and `profile_picture`
2. Update any database client or schema configuration to match the new database structure
