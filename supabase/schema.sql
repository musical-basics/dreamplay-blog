-- DreamPlay Blog Schema
-- Run this in your Supabase SQL Editor (same DB as emailer)

CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  category text DEFAULT 'tutorials',
  featured_image text,
  html_content text,
  variable_values jsonb DEFAULT '{}'::jsonb,
  status text CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Replaces campaign_versions for the History Sheet
CREATE TABLE IF NOT EXISTS post_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  html_content text NOT NULL,
  prompt text,
  created_at timestamptz DEFAULT now()
);
