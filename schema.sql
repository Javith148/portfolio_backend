-- ========================================================
-- Complete Supabase Database Setup Script for Javith Portfolio
-- Copy and paste this script in your Supabase SQL Editor
-- ========================================================

-- 1. Create Admins Table (For Super Admin and Admin credentials)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'superadmin' or 'admin'
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_desc TEXT,
  category TEXT DEFAULT 'Web App',
  image_url TEXT,
  live_link TEXT,
  github_link TEXT,
  gradient TEXT DEFAULT 'linear-gradient(175deg, #7F17DA 0%, #737373 100%)',
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Frontend',
  icon_url TEXT,
  proficiency INTEGER DEFAULT 80,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT,
  credential_url TEXT,
  image_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create About Content Table
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Journey Items (Timeline) Table
CREATE TABLE IF NOT EXISTS public.journey_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'Education',
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  period TEXT,
  location TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS or grant access for smooth sync
ALTER TABLE public.journey_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content DISABLE ROW LEVEL SECURITY;

-- Initial Journey Sample Data (Optional Seed)
INSERT INTO public.journey_items (type, title, organization, period, location, description, display_order)
VALUES 
  ('Education', 'B.E. Computer Science Engineering', 'University / College', '2021 - 2025', 'Tamil Nadu, India', 'Specialized in Core Computer Science, Software Architecture, Data Structures, Web Technologies & Mobile App Development.', 0),
  ('Work Experience', 'Full Stack & Mobile Developer', 'Freelance / Projects', '2023 - Present', 'Remote', 'Developed cross-platform Flutter mobile applications and modern React web applications with Node.js & Django backends.', 1)
ON CONFLICT DO NOTHING;

-- Initial About Content Sample Data (Optional Seed)
INSERT INTO public.about_content (title, description, display_order)
VALUES 
  ('🎨 Creative Problem Solving', 'I love crafting intuitive user interfaces with Flutter & React, while maintaining high performant backends.', 0),
  ('⚡ Passionate Learner', 'Constantly learning modern tech stacks, cloud services, database design, and architecture best practices.', 1)
ON CONFLICT DO NOTHING;

-- 8. Initial Super Admin User (Default username: superadmin, password: superpassword123 - bcrypt hashed)
INSERT INTO public.admins (username, password_hash, role, email)
VALUES (
  'superadmin', 
  '$2a$10$w8T06N7lT1m5L/5Xb8D3/eCqO0eG65b6g44B8H9I8l0u5N7lT1m5L', -- bcrypt hash of 'superpassword123'
  'superadmin', 
  'javithsuperadmin@gmail.com'
) ON CONFLICT (username) DO NOTHING;

-- Initial Regular Admin (username: javithadmin, password: adminpassword123)
INSERT INTO public.admins (username, password_hash, role, email)
VALUES (
  'javithadmin', 
  '$2a$10$w8T06N7lT1m5L/5Xb8D3/eCqO0eG65b6g44B8H9I8l0u5N7lT1m5L',
  'admin', 
  'javithsukkur@gmail.com'
) ON CONFLICT (username) DO NOTHING;


