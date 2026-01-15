/**
 * Supabase Storage helpers for post media
 */

import { createClient } from "@/lib/supabase/server";

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  userId: string,
  postId: string,
  file: File,
  position: number,
): Promise<UploadResult> {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${position}.${fileExt}`;
  const filePath = `${userId}/${postId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("post-media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-media").getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl,
  };
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(filePath: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from("post-media").remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete all images for a post
 */
export async function deletePostImages(
  userId: string,
  postId: string,
): Promise<void> {
  const supabase = await createClient();
  const folderPath = `${userId}/${postId}`;

  const { data, error } = await supabase.storage
    .from("post-media")
    .list(folderPath);

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  if (data && data.length > 0) {
    const filesToDelete = data.map((file) => `${folderPath}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from("post-media")
      .remove(filesToDelete);

    if (deleteError) {
      throw new Error(`Failed to delete images: ${deleteError.message}`);
    }
  }
}
