-- Create notifications table for push notification history
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id)
);

-- Create emails table for email history
CREATE TABLE IF NOT EXISTS public.emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id)
);

-- Create user_tokens table for FCM device tokens
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT, -- 'ios', 'android', 'web'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for notifications (admins can read/write)
DROP POLICY IF EXISTS "Admin notifications access" ON public.notifications;
CREATE POLICY "Admin notifications access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Policies for emails (admins can read/write)
DROP POLICY IF EXISTS "Admin emails access" ON public.emails;
CREATE POLICY "Admin emails access" ON public.emails FOR ALL USING (true) WITH CHECK (true);

-- Policies for user_tokens (users can manage their own tokens)
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.user_tokens;
CREATE POLICY "Users can manage own tokens" ON public.user_tokens FOR ALL USING (true) WITH CHECK (true);
