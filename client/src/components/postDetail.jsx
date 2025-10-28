import { useParams, Link } from 'react-router-dom';
import { usePost } from '../hooks/Api'; 
import { useAuth } from '../context/AuthContext'; 


import React, { useState, useCallback } from 'react'; 
import CommentForm from '../components/CommentForm'; 

const API_BASE_URL = 'http://localhost:5000'; 

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  // State for forcing refresh after a new comment is added
  const [refreshKey, setRefreshKey] = useState(0); 
  
  // Pass the refresh key to the hook to force a re-fetch when it changes
  const { post, loading, error } = usePost(id, refreshKey); 
  
  const handleCommentAdded = useCallback(() => {
      setRefreshKey(prevKey => prevKey + 1); 
  }, []);

  if (loading) return <p className="text-center text-xl p-8">Loading post...</p>;
  if (error) return <p className="text-center text-red-500 text-xl p-8">Error: {error}</p>;
  if (!post) return <p className="text-center text-xl p-8">Post not found.</p>;

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{post.title}</h1>

      {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
          <img 
              src={`${API_BASE_URL}${post.featuredImage}`} 
              alt={post.title}
              className="w-full h-auto max-h-[400px] object-cover rounded-lg mb-6" 
          />
      )}
      
      <div className="text-sm text-gray-500 mb-6 border-b pb-4">
        <p>Author: <span className="font-semibold">{post.author?.username || 'N/A'}</span></p>
        <p>Category: <span className="font-semibold">{post.category?.name || 'Uncategorized'}</span></p>
        <p>Views: <span className="font-semibold">{post.viewCount}</span></p>
      </div>
      
      <div className="prose max-w-none mb-8 border-b pb-8">
        <p>{post.content}</p> 
      </div>
      
      <Link 
        to={`/edit/${post._id}`} 
        className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-150 mb-8"
      >
        Edit Post
      </Link>

      <h3 className="text-2xl font-bold mb-4">Comments ({post.comments?.length || 0})</h3>

      {user ? (
          <CommentForm 
            postId={post._id} 
            onCommentAdded={handleCommentAdded} 
          />
      ) : (
          <p className="mb-8 text-indigo-600">Please log in to leave a comment.</p>
      )}


      <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                  <div key={comment._id} className="border-l-4 border-indigo-400 pl-3 py-2 bg-gray-50 rounded">
                      <p className="text-gray-800">{comment.content}</p>
                      <small className="text-gray-500">
                          By: {comment.user?.username} on {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                  </div>
              ))
          ) : (
              <p className="text-gray-500">No comments yet. Be the first!</p>
          )}
      </div>

    </div>
  );
}
