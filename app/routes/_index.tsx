import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

interface Post {
  id: number;
  title: string;
}
const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [page, setPage] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      // avoid race condition
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);

      try {
        const response = await fetch(`${BASE_URL}/posts?page=${page}`, {
          signal: abortControllerRef.current?.signal,
        });
        const posts = (await response.json()) as Post[];
        setPosts(posts);
      } catch (e: any) {
        if (e.name === "AbortError") {
          console.log("Aborted");
          return;
        }
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Uh, oh! Please try again...</div>;
  }

  return (
    <div className="fetch-tutorial">
      <h1 className="mb-4 text-2xl">Data Fetching in Reacts</h1>
      <button onClick={() => setPage(page + 1)}>
        Load more pages ({page})
      </button>
      <ul>
        {posts.map((post) => {
          return <li key={post.id}>{post.title}</li>;
        })}
      </ul>
    </div>
  );
}
