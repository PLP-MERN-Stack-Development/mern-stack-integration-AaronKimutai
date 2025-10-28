import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

import { usePost, useCategories } from '../hooks/Api'; 
import { useAuth } from '../context/AuthContext';
import { usePostsContext } from '../context/postContext'; 

const API_BASE_URL = 'http://localhost:5000/api/posts'; 

export default function PostForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    

    const { token, user } = useAuth();
    const { addPost, updatePost, removePost } = usePostsContext(); 
    const { post: postToEdit, loading: fetchLoading, error: fetchError } = usePost(isEditing ? id : null);
    const { categories, loading: catLoading } = useCategories();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [tags, setTags] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [featuredImage, setFeaturedImage] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [submissionSuccess, setSubmissionSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const isNewCategory = newCategoryName.trim().length > 0 && !category;

    // data fetching and initialization 
    useEffect(() => {
        if (isEditing && postToEdit) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setCategory(postToEdit.category?.name || ''); 
        }
    }, [isEditing, postToEdit]);

    
    const validateForm = () => {
        const errors = {};
        if (!title.trim() || title.length < 5) {
            errors.title = "Title must be at least 5 characters long.";
        }
        if (!content.trim() || content.length < 50) {
            errors.content = "Content must be at least 50 characters long.";
        }
        
        if (isNewCategory) {
            if (!newCategoryName.trim()) {
                errors.category = "Please enter a name for the new category.";
            }
        } else if (!category) {
            errors.category = "Please select a category.";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

 
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setSubmissionError(null);
        setSubmissionSuccess(null);
        setValidationErrors({});

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append("tags", tags);
        formData.append("excerpt", excerpt);


        if (isNewCategory) {
            formData.append('newCategoryName', newCategoryName.trim());
        } else {
            const selectedCategory = categories.find(cat => cat.name === category);
            if (selectedCategory) {
                 formData.append('category', selectedCategory._id);
            } else {
                 setSubmissionError('Error: Invalid or missing category selection.');
                 setLoading(false);
                 return;
            }
        }

        if (featuredImage) {
            formData.append('featuredImage', featuredImage); 
        }

        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", 
            } 
        };
        
        let tempId = null; 

        try {
            if (isEditing) {
                updatePost({ _id: id, title, content, category }); 
                await axios.put(`${API_BASE_URL}/${id}`, formData, config); 
                setSubmissionSuccess('Post updated successfully!');
            } else {
                tempId = 'temp-' + Date.now().toString(); 
                
                const optimisticPost = { 
                    _id: tempId, 
                    title, 
                    content, 
                    category: { name: category || newCategoryName }, 
                    author: { username: user?.username || 'Guest Author' }, 
                    isLoading: true 
                };
                
                addPost(optimisticPost);
                
                const { data: savedPost } = await axios.post(API_BASE_URL, formData, config);
                
                updatePost(savedPost, tempId); 
                setSubmissionSuccess('Post created successfully!');
            }

            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            console.error('Submission Error:', error);
            
            if (!isEditing && tempId) { removePost(tempId); } 
            
            const errorMessage = error.response?.data?.message || 'Submission failed. Check your file size/type.';
            setSubmissionError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user || postToEdit?.author?.username !== user.username) {
            alert('You are not authorized to delete this post.');
            return;
        }

        if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
            try {
                removePost(id); 
                await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setSubmissionSuccess('Post deleted successfully!');
                setTimeout(() => navigate('/'), 500);
            } catch (error) {
                console.error(error);
                setSubmissionError('Failed to delete post.');
            }
        }
    };


    if (fetchLoading || catLoading) return <p className="text-center text-xl p-8">Loading form data...</p>;
    if (isEditing && fetchError) return <p className="text-center text-red-500 text-xl p-8">Error loading post: {JSON.stringify(fetchError)}</p>;
    if (!token) return <p className="text-center text-red-500 text-xl p-8">You must be logged in to create or edit posts.</p>

    return (
        <div className="max-w-xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-xl text-gray-900">
            <ToastContainer />
            <h2 className="text-3xl font-bold mb-6 text-center">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>

            {submissionError && <p className="text-red-500 border border-red-300 p-2 rounded mb-4">{submissionError}</p>}
            {submissionSuccess && <p className="text-green-600 border border-green-300 p-2 rounded mb-4">{submissionSuccess}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                <input
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
                <textarea
                    placeholder="Post Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="6"
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
                <select 
                    value={category} 
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setNewCategoryName(""); 
                    }}
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">Select Existing Category</option>
                    {Array.isArray(categories) &&
                        categories.map((cat) => (
                            <option key={cat._id} value={cat._id}> 
                                {cat.name}
                            </option>
                        ))}
                </select>
                <input
                    type="text"
                    placeholder="Or enter a NEW category name"
                    value={newCategoryName}
                    onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategory(""); 
                    }}
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                />

                <textarea
                    placeholder="Post Excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows="3"
                    className="w-full p-3 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                />

                <label className="block text-gray-700 font-medium pt-2">Featured Image (Max 5MB)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFeaturedImage(e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded text-gray-900"
                />

                <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150"
                >
                    {isEditing ? 'Update Post' : 'Create Post'}
                </button>
                {isEditing && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-150"
                    >
                        Delete Post
                    </button>
                )}
            </form>
        </div>
    );
};

