import { toast } from "sonner";

const CLIENT_ID = "8uETlZiCEaiuZbLXYeudfg"; // Reddit installed app client ID
const REDIRECT_URI = import.meta.env.PROD 
  ? "https://saved-posts-fetcher.lovable.app/"
  : "http://localhost:8080/";
const SCOPES = ["history", "identity"];

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  url: string;
  created_utc: number;
  permalink: string;
  thumbnail: string;
}

export const generateRandomString = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0].toString(36);
};

export const initiateRedditAuth = () => {
  const state = generateRandomString();
  localStorage.setItem("reddit_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "token",
    state: state,
    redirect_uri: REDIRECT_URI,
    duration: "temporary",
    scope: SCOPES.join(" ")
  });

  window.location.href = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
};

export const handleRedditCallback = (hash: string) => {
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const state = params.get("state");
  const storedState = localStorage.getItem("reddit_state");

  if (!accessToken || !state || state !== storedState) {
    toast.error("Authentication failed");
    return null;
  }

  localStorage.removeItem("reddit_state");
  return accessToken;
};

export const fetchSavedPosts = async (accessToken: string): Promise<RedditPost[]> => {
  try {
    console.log("Fetching saved posts with token:", accessToken);
    const response = await fetch("https://oauth.reddit.com/user/me/saved?limit=100", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "web:saved-posts-fetcher:v1.0.0",
      },
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Failed to fetch saved posts: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Received data:", data);

    if (!data.data?.children) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid API response format");
    }

    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      url: child.data.url,
      created_utc: child.data.created_utc,
      permalink: `https://reddit.com${child.data.permalink}`,
      thumbnail: child.data.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    toast.error("Failed to fetch saved posts");
    return [];
  }
};