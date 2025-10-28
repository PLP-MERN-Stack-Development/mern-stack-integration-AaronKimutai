import { Link } from 'react-router-dom';
import { usePosts, useCategories } from '../hooks/Api';
import { useAuth } from '../context/AuthContext';
import { useState, useCallback } from 'react'; 


const API_BASE_URL = 'http://localhost:5000'; 

export default function PostList() {
    // State for controls
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    
    const queryConfig = { 
        page, 
        limit: 5, 
        search: searchTerm,
        category: categoryFilter
    };

    const { posts, loading, error, pagination } = usePosts(queryConfig); 
    const { categories } = useCategories(); 

    const { user } = useAuth();
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); 
    };

    if (loading) return <p className="text-center text-xl p-8">Loading posts...</p>;
    if (error) return <p className="text-center text-red-500 text-xl p-8">Error loading posts: {error}</p>;
    if (!posts || posts.length === 0) return <p className="text-center text-xl p-8">No posts found. Create the first one!</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">All Blog Posts</h1>
            
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search titles and content..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-1/2 p-2 border rounded shadow-sm text-gray-900"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setPage(1); 
                    }}
                    className="w-full md:w-1/4 p-2 border rounded shadow-sm text-gray-900"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {posts.map((post) => (
              <div key={post._id} className="post-card p-4 mb-4 bg-white rounded shadow hover:shadow-md transition duration-200 flex space-x-4 text-gray-900">
                    
                    {post.featuredImage && (
                        <img 
                            src={`${API_BASE_URL}${post.featuredImage}`} 
                            alt={post.title}
                            className="w-24 h-24 object-cover rounded shrink-0" 
                        />
                    )}
                    
                    <div className="grow"> 
                        <h2 className="text-xl font-semibold mb-1">
                            <Link to={`/posts/${post._id}`} className="text-indigo-600 hover:underline">{post.title}</Link>
                        </h2>
                        <p className="text-gray-700">{post.content.substring(0, 100)}...</p>
                        <small className="text-gray-500">Author: {post.author?.username || 'Unknown'}</small>

                        {user && post.author?.username === user.username && (
                            <div className="mt-2 space-x-2">
                                <Link to={`/edit/${post._id}`} className="text-green-600 hover:underline">Edit</Link>
                            </div>
                        )}
                    </div>
                </div>
            ))}

  
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition"
                    >
                        Previous
                    </button>
                    <span className="text-lg font-medium text-gray-700">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 hover:bg-indigo-700 transition"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
