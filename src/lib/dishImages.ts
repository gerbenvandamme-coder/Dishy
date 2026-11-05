import { supabase } from "@/lib/supabase";

const DISH_IMAGES_BUCKET = "dish-images";

/** Must match file_size_limit and allowed_mime_types of the bucket in supabase/family_workspace.sql. */
export const MAX_DISH_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Value for the file input's accept attribute. */
export const DISH_IMAGE_ACCEPT = Object.keys(EXTENSION_BY_TYPE).join(",");

/**
 * Uploads a photo to the shared bucket and returns its public URL.
 * Every upload gets a new random path, so a replaced photo is a new URL: other devices never
 * show a cached old image, and saving the URL on the dish triggers a realtime update.
 * Throws an Error with a message that can be shown to the user.
 */
export async function uploadDishImage(file: File): Promise<string> {
  const client = supabase;
  if (!client) throw new Error("Foto's uploaden werkt alleen met een Supabase-verbinding.");

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) throw new Error("Kies een JPG-, PNG-, WebP-, GIF- of AVIF-afbeelding.");
  if (file.size > MAX_DISH_IMAGE_BYTES) throw new Error("De foto is groter dan 5 MB.");

  const path = `${crypto.randomUUID()}.${extension}`;
  const bucket = client.storage.from(DISH_IMAGES_BUCKET);

  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("De foto kon niet worden geüpload. Probeer het opnieuw.");

  return bucket.getPublicUrl(path).data.publicUrl;
}