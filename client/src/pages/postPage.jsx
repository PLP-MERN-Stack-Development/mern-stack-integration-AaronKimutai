import { useParams } from 'react-router-dom';
import { usePost } from '../hooks/Api';

export default function PostPage() {
  const { id } = useParams();
  const { data: post, loading, error } = usePost(`/posts/${id}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>Author: {post.author.username}</p>
      <p>Category: {post.category.name}</p>
    </div>
  );
}
