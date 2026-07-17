-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin role management
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content table for PDFs, timetables, etc.
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('pdf', 'timetable', 'weightage', 'notes', 'video')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_messages table for chat support
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'content', 'reminder', 'system')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (admins only)
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subjects (public read, admin write)
CREATE POLICY "Anyone can view active subjects"
  ON public.subjects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for content (public read, admin write)
CREATE POLICY "Anyone can view active content"
  ON public.content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for advertisements (public read, admin write)
CREATE POLICY "Anyone can view active ads"
  ON public.advertisements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage ads"
  ON public.advertisements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for support_messages
CREATE POLICY "Users can view own messages"
  ON public.support_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can send messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_from_admin = false);

CREATE POLICY "Admins can view all messages"
  ON public.support_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can send messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND is_from_admin = true);

CREATE POLICY "Admins can update messages"
  ON public.support_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for content files
INSERT INTO storage.buckets (id, name, public) VALUES ('content-files', 'content-files', true);

-- Create storage bucket for advertisements
INSERT INTO storage.buckets (id, name, public) VALUES ('advertisements', 'advertisements', true);

-- Storage policies for content-files
CREATE POLICY "Anyone can view content files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-files');

CREATE POLICY "Admins can upload content files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for advertisements
CREATE POLICY "Anyone can view advertisement files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'advertisements');

CREATE POLICY "Admins can upload advertisement files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'advertisements' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update advertisement files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'advertisements' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete advertisement files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'advertisements' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime for support messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('10th Grade', '10th', 'Andhra Pradesh State Government Syllabus', 'BookOpen', 1),
  ('Intermediate', 'intermediate', 'Board of Intermediate Education, AP', 'GraduationCap', 2),
  ('Diploma', 'diploma', 'AP State Board of Technical Education', 'FileText', 3),
  ('EAPCET', 'eapcet', 'Engineering, Agriculture & Pharmacy Common Entrance Test', 'Target', 4),
  ('B-Tech', 'btech', 'Engineering Programs - Coming Soon', 'Laptop', 5);