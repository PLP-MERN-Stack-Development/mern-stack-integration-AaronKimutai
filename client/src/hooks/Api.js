import { useState, useEffect, useCallback } from 'react';
import { postService, categoryService } from '../services/api';


export const usePosts = (queryConfig = {}) => { 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalPosts: 0, limit: 10 }); 

  const fetchPosts = useCallback(async (config) => { 
    try {
      setLoading(true);
      const params = new URLSearchParams(config).toString();
      const url = `/posts?${params}`;


      const response = await postService.getAllPosts(url); 
      
      setPosts(response.posts); 
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalPosts: response.totalPosts,
        limit: response.limit || 10
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(queryConfig); 
  }, [fetchPosts, JSON.stringify(queryConfig)]); 

  return { posts, loading, error, pagination, refetch: fetchPosts }; 
};


export const usePost = (idOrSlug) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    
    if (!idOrSlug) {
      setLoading(false);
      setPost(null); 
      return;
    }
    
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(idOrSlug); 
        setPost(data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
            setError('The requested post could not be found.');
            setPost(null); 
        } else {
            setError(err.message || 'Failed to fetch post due to network error.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [idOrSlug]); 

  return { post, loading, error };
};


export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); 
      setError(null); 

      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Category Fetch Error:", err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false); 
      }
    };
    
    fetchCategories();
  }, []); 

  return { categories, loading, error };
};
