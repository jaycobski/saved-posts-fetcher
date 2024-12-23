import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SavedPosts } from "@/components/SavedPosts";
import { initiateRedditAuth, handleRedditCallback } from "@/utils/reddit";

const Index = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for access token in URL hash
    if (window.location.hash) {
      const token = handleRedditCallback(window.location.hash);
      if (token) {
        setAccessToken(token);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (!accessToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold mb-8">Reddit Saved Posts Viewer</h1>
        <Button
          onClick={initiateRedditAuth}
          className="bg-reddit-primary hover:bg-reddit-hover text-white"
        >
          Connect with Reddit
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Saved Posts</h1>
      <SavedPosts accessToken={accessToken} />
    </div>
  );
};

export default Index;