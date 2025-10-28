const Post = require('../models/Post');
const Category = require('../models/Category'); 
const mongoose = require('mongoose');


const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// get post 
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const categoryId = req.query.category; 
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by title or content 
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { content: searchRegex }
            ];
        }

       
        if (categoryId) {
            query.category = categoryId;
        }

        
        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        // Fetch posts with filters, pagination, and population
        const posts = await Post.find(query)
            .populate('author', 'username email')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip) 
            .limit(limit); 

        
        res.status(200).json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts,
            limit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const identifier = req.params.id; 
        let post;

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            post = await Post.findById(String(identifier)); 
        }
        if (!post) {
             post = await Post.findOne({ slug: String(identifier) });
        }

        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.populate([
            { path: 'author', select: 'username email' },
            { path: 'category', select: 'name' },
            { path: 'comments.user', select: 'username' }
        ]); 

        post.viewCount += 1;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        if (error instanceof mongoose.CastError) {
            return res.status(400).json({ message: "Invalid Post Identifier." });
        }
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        req.body.author = req.user.id; 
        
        const { title, content, category, tags, excerpt, newCategoryName, author } = req.body || {};
        const featuredImage = req.file ? `/uploads/${req.file.filename}` : undefined;
        
        let categoryId = category; 
        
        if (newCategoryName && newCategoryName.trim()) {
            let newCat = await Category.findOne({ name: newCategoryName.trim() });
            if (!newCat) {
                newCat = await Category.create({ 
                    name: newCategoryName.trim(), 
                    description: `User-created category: ${newCategoryName.trim()}` 
                });
            }
            categoryId = newCat._id; 
        }

        const postSlug = slugify(title); 
        
        const newPost = await Post.create({
            title,
            content,
            slug: postSlug,
            category: categoryId, 
            author: author, 
            tags: tags || [],
            excerpt: excerpt || '',
            featuredImage: featuredImage || 'default-post.jpg',
        });

        const fullPost = await Post.findById(newPost._id)
            .populate([
                { path: 'author', select: 'username email' },
                { path: 'category', select: 'name' }
            ])
            .exec(); 
            
        res.status(201).json(fullPost);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Post title is already in use (duplicate slug)." });
        }
        res.status(400).json({ message: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, content, category, tags, excerpt, isPublished, newCategoryName } = req.body || {};
        const featuredImageFile = req.file ? `/uploads/${req.file.filename}` : undefined;

        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }
        
        let categoryId = category; 
        
        if (newCategoryName && newCategoryName.trim()) {
            let newCat = await Category.findOne({ name: newCategoryName.trim() });
            if (!newCat) {
                newCat = await Category.create({ 
                    name: newCategoryName.trim(), 
                    description: `User-created category: ${newCategoryName.trim()}` 
                });
            }
            categoryId = newCat._id; 
        }
        

        if (title) {
             post.title = title;
             post.slug = slugify(title); 
        }
        if (content) post.content = content;
        if (categoryId) post.category = categoryId; 
        if (tags) post.tags = tags;
        if (excerpt) post.excerpt = excerpt;
        if (typeof isPublished !== "undefined") post.isPublished = isPublished;

        if (featuredImageFile) { 
            post.featuredImage = featuredImageFile;
        }

        const updatedPostDoc = await post.save();
        
        await updatedPostDoc.populate([
            { path: 'author', select: 'username email' },
            { path: 'category', select: 'name' }
        ]);
            
        res.status(200).json(updatedPostDoc);

    } catch (error) {
        if (error instanceof mongoose.CastError) {
            return res.status(400).json({ message: "Invalid Post ID format." });
        }
        res.status(400).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found!' });

        if (post.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ message: "Post deleted successfully. Bye!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addComment = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { content } = req.body;

        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found!' });

        const updatedPost = await post.addComment(userId, content);

        await updatedPost.populate([
            { path: 'author', select: 'username email' },
            { path: 'category', select: 'name' },
            { path: 'comments.user', select: 'username' }
        ]);

        res.status(201).json(updatedPost); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addComment
};