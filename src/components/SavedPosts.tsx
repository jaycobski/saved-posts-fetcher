import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RedditPost, fetchSavedPosts } from "@/utils/reddit";
import { ExternalLink } from "lucide-react";

interface SavedPostsProps {
  accessToken: string;
}

export const SavedPosts = ({ accessToken }: SavedPostsProps) => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const fetchedPosts = await fetchSavedPosts(accessToken);
      setPosts(fetchedPosts);
      setLoading(false);
    };

    loadPosts();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
          <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="text-reddit-primary font-medium">r/{post.subreddit}</span>
            <span className="mx-2">•</span>
            <span>{post.score} points</span>
          </div>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-gray-500 hover:text-reddit-primary"
          >
            View on Reddit
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Card>
      ))}
    </div>
  );
};