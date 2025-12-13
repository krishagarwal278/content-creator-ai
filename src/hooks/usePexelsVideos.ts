import { useQuery } from "@tanstack/react-query";

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

// Mock video data for UI development
const mockVideos: PexelsVideo[] = [
  {
    id: 1,
    url: "https://www.pexels.com/video/1",
    image: "https://images.pexels.com/videos/1/free-video-1.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    duration: 15,
    width: 1920,
    height: 1080,
    user: "John Doe",
    videoFiles: [
      {
        id: 1,
        quality: "hd",
        fileType: "video/mp4",
        width: 1920,
        height: 1080,
        link: "https://example.com/video1.mp4",
      },
    ],
  },
  {
    id: 2,
    url: "https://www.pexels.com/video/2",
    image: "https://images.pexels.com/videos/2/free-video-2.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    duration: 20,
    width: 1920,
    height: 1080,
    user: "Jane Smith",
    videoFiles: [
      {
        id: 2,
        quality: "hd",
        fileType: "video/mp4",
        width: 1920,
        height: 1080,
        link: "https://example.com/video2.mp4",
      },
    ],
  },
  {
    id: 3,
    url: "https://www.pexels.com/video/3",
    image: "https://images.pexels.com/videos/3/free-video-3.jpg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    duration: 30,
    width: 1920,
    height: 1080,
    user: "Mike Johnson",
    videoFiles: [
      {
        id: 3,
        quality: "hd",
        fileType: "video/mp4",
        width: 1920,
        height: 1080,
        link: "https://example.com/video3.mp4",
      },
    ],
  },
];

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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Return mock data
      return {
        videos: mockVideos,
        totalResults: mockVideos.length,
      };
    },
    enabled: enabled && !!query,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
