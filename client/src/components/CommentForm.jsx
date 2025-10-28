import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/posts';


export default function CommentForm({ postId, onCommentAdded }) {
    const { token } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!content.trim()) {
            setError('Comment cannot be empty.');
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            
            
            const response = await axios.post(
                `${API_BASE_URL}/${postId}/comments`,
                { content },
                config
            );

            
            setContent('');
            if (onCommentAdded) {
                onCommentAdded(response.data); 
            }
        } catch (err) {
            console.error("Comment submission failed:", err);
            setError(err.response?.data?.message || 'Failed to submit comment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 p-4 border rounded bg-gray-50">
            <h4 className="text-lg font-semibold mb-3">Leave a Comment</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <textarea
                    placeholder="Your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="3"
                    required
                    disabled={loading}
                    className="w-full p-2 border rounded focus:ring-indigo-500 text-gray-900"
                />
                
                <button
                    type="submit"
                    disabled={loading || !token}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Submitting...' : 'Submit Comment'}
                </button>
            </form>
        </div>
    );
}
