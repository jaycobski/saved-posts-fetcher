import { toast } from "sonner";

const CLIENT_ID = "YOUR_CLIENT_ID"; // Replace with your Reddit app client ID
const REDIRECT_URI = window.location.origin + "/";
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

  const authUrl = new URL("https://www.reddit.com/api/v1/authorize");
  authUrl.searchParams.append("client_id", CLIENT_ID);
  authUrl.searchParams.append("response_type", "token");
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.append("duration", "temporary");
  authUrl.searchParams.append("scope", SCOPES.join(" "));

  window.location.href = authUrl.toString();
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
    const response = await fetch("https://oauth.reddit.com/user/me/saved", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch saved posts");
    }

    const data = await response.json();
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