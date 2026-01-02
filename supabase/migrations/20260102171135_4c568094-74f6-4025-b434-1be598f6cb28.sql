-- Make avatars bucket public so profile images can be displayed via getPublicUrl()
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';