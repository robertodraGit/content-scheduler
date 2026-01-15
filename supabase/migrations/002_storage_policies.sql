-- Storage bucket policies for post-media
-- Note: The bucket itself needs to be created via Supabase Dashboard or API
-- This file contains only the RLS policies for the bucket

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to view files in their own folder
CREATE POLICY "Users can view files in their own folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to update files in their own folder
CREATE POLICY "Users can update files in their own folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to delete files in their own folder
CREATE POLICY "Users can delete files in their own folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow public read access (needed for Instagram API which requires public URLs)
CREATE POLICY "Public can view files in post-media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');
