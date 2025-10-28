const { getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory} = require('../controllers/categoryController');

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 


// get all categories 
router.get('/', getCategories);

// update category by id 
router.put('/:id', protect, updateCategory); 

// create new category 
router.post('/', protect, createCategory); 

// delete category by id 
router.delete('/:id', protect, deleteCategory); 

// export
module.exports = router;