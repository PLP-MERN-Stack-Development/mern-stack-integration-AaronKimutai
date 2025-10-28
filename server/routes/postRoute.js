const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const postController = require("../controllers/postController");

const router = express.Router();

// Create a post 
router.post("/", protect, upload.single("featuredImage"), postController.createPost);

// Get all posts
router.get("/", postController.getPosts);

// get a single post by ID or slug
router.get("/:id", postController.getPostById);

module.exports = router;
