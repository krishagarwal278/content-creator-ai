import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PexelsVideo {
  id: number;
  url: string;
  image: string;
  duration: number;
  width: number;
  height: number;
  user: string;
  videoFiles: {
    id: number;
    quality: string;
    fileType: string;
    width: number;
    height: number;
    link: string;
  }[];
}

interface SearchResult {
  videos: PexelsVideo[];
  totalResults: number;
}

export function usePexelsVideos(
  query: string,
  options?: {
    perPage?: number;
    orientation?: "landscape" | "portrait" | "square";
    enabled?: boolean;
  }
) {
  const { perPage = 10, orientation = "landscape", enabled = true } = options || {};

  return useQuery({
    queryKey: ["pexels-videos", query, perPage, orientation],
    queryFn: async (): Promise<SearchResult> => {
      const { data, error } = await supabase.functions.invoke("search-pexels-videos", {
        body: { query, perPage, orientation },
      });

      if (error) throw error;
      return data as SearchResult;
    },
    enabled: enabled && !!query,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
