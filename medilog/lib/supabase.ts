import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const uploadFile = async (
  file: File,
  path: string,
  bucket: string = 'medical-documents'
) => {
  // Use the service role for server-side uploads to bypass RLS
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
};

export const downloadFile = async (path: string, bucket: string = 'medical-documents') => {
  // Use admin for server-side downloads
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
};

export const deleteFile = async (path: string, bucket: string = 'medical-documents') => {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
  return true;
};

export const getFileUrl = (path: string, bucket: string = 'medical-documents') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};
