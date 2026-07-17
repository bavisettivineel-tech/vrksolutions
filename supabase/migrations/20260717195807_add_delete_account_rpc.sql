-- Create a security definer function to delete the authenticated user
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Delete push subscriptions (which don't cascade automatically)
  DELETE FROM public.push_subscriptions WHERE user_id = v_user_id;
  
  -- Delete support messages
  DELETE FROM public.support_messages WHERE user_id = v_user_id;

  -- Delete roles
  DELETE FROM public.user_roles WHERE user_id = v_user_id;

  -- Delete profiles
  DELETE FROM public.profiles WHERE user_id = v_user_id;

  -- Delete notifications
  DELETE FROM public.notifications WHERE user_id = v_user_id;

  -- Finally, delete the user from auth.users (this requires superuser/security definer)
  DELETE FROM auth.users WHERE id = v_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create deletion_requests table for unauthenticated / offline users
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to insert deletion requests
CREATE POLICY "Anyone can submit a deletion request" 
  ON public.deletion_requests FOR INSERT 
  WITH CHECK (true);

-- Only admins can view or update deletion requests
CREATE POLICY "Admins can manage deletion requests" 
  ON public.deletion_requests FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Apply updated_at trigger to deletion_requests
CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON public.deletion_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
