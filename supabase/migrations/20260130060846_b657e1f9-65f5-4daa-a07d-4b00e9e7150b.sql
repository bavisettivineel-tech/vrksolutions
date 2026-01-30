-- Drop and recreate user_roles policies to fix admin detection
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- Allow authenticated users to view all roles (needed for admin detection)
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Allow the trigger to insert roles (using security definer function)
-- The handle_new_user function already runs with SECURITY DEFINER

-- Allow admins to manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admin user role if logging in with admin credentials
-- This is done via a special function that checks credentials
CREATE OR REPLACE FUNCTION public.set_admin_role(_user_id UUID, _name TEXT, _phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the admin credentials
  IF _name = 'vrk.@info.in' AND _phone = '8297458070' THEN
    -- Insert or update role to admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;