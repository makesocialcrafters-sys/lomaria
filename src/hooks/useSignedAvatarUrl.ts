import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage path from a value that might be a full URL or a relative path.
 * Returns null if input is null/undefined/empty.
 */
function extractStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;

  // If it's already a relative path (e.g. "userId/avatar.jpg"), return as-is
  if (!value.startsWith("http")) {
    // Strip any query params (cache busters)
    return value.split("?")[0];
  }

  // Extract path after "/avatars/" from full URL
  const marker = "/avatars/";
  const idx = value.indexOf(marker);
  if (idx === -1) return null;

  const path = value.substring(idx + marker.length);
  // Strip query params
  return path.split("?")[0];
}

async function fetchSignedUrl(storagePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (error || !data?.signedUrl) {
      // Silently return null — file may not exist (deleted account, etc.)
      return null;
    }

    return data.signedUrl;
  } catch {
    // Silently return null on any error
    return null;
  }
}

export function useSignedAvatarUrl(profileImage: string | null | undefined) {
  const storagePath = extractStoragePath(profileImage);

  return useQuery({
    queryKey: ["signed-avatar", storagePath],
    queryFn: () => fetchSignedUrl(storagePath!),
    enabled: !!storagePath,
    staleTime: 45 * 60 * 1000, // 45 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  });
}
