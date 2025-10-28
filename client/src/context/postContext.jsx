import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { postService } from '../services/api'; 
import { usePosts as useFetchPosts } from '../hooks/Api'; 
export const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const { posts: fetchedPosts, loading, error, refetch } = useFetchPosts(); 
    
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (fetchedPosts) {
            setPosts(fetchedPosts);
        }
    }, [fetchedPosts]);

    const addPost = (newPost) => {
        setPosts(currentPosts => [newPost, ...currentPosts]);
    };

    const updatePost = (updatedPost, tempId = null) => {
        setPosts(currentPosts => 
            currentPosts.map(p => {
                if (tempId && p._id === tempId) return updatedPost;
                if (p._id === updatedPost._id) return updatedPost;
                return p;
            })
        );
    };

    const removePost = (id) => {
        setPosts(currentPosts => currentPosts.filter(p => p._id !== id));
    };

    return (
        <PostContext.Provider value={{ posts, loading, error, refetch, addPost, updatePost, removePost }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePostsContext = () => useContext(PostContext);
