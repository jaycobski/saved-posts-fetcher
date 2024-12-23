import { toast } from "sonner";

const CLIENT_ID = "C0bKNKqDSpFAJ8zX8pa07A";
const REDIRECT_URI = import.meta.env.PROD 
  ? "https://lovable.dev/projects/59dec005-bbd9-4ac1-825c-74ea273de4f6"
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
