/*
  # Create storage bucket for logos

  1. New Storage Bucket
    - Creates a public bucket for storing company logos
    - Enables RLS policies for secure access
  
  2. Security
    - Allows authenticated users to upload their own logos
    - Allows public access for viewing logos
*/

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

-- Create objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Create logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can upload their own logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can read logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Create helper function for extracting folder name
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN string_to_array(name, '/');
END
$$;