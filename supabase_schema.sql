-- Updated users table schema
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely enable Realtime
DO $$
BEGIN
  -- Add messages to realtime if not already there
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  
  -- Add users to realtime if not already there
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END $$;

-- Enable Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Re-create policies (authenticated-only, minimal guard)
DROP POLICY IF EXISTS "Public users access" ON public.users;
CREATE POLICY "Users authenticated read" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public messages access" ON public.messages;
CREATE POLICY "Messages authenticated read" ON public.messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Messages authenticated insert" ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Allow only authenticated admins to create chat users
-- Requires a table public.admins(email TEXT, name TEXT, auth_user_id UUID)
DROP POLICY IF EXISTS "Users authenticated insert" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_user_id = auth.uid()
         OR a.email = auth.jwt() ->> 'email'
    )
  );

-- TEMPORARY: allow any authenticated user to insert users (drop when admin rows are fixed)
DROP POLICY IF EXISTS "Users authenticated insert (temp)" ON public.users;
CREATE POLICY "Users authenticated insert (temp)" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
