const {getUsers, getUser, createUser, updateUser, deleteUser
} = require('../controllers/userController')

const express = require('express');
const router = express.Router();

// routers
// get all users
router.get('/', getUsers);

// get user by id
router.get('/:id', getUser);

// create user
router.post('/', createUser);

// update user by id
router.put('/:id', updateUser);

// delete user by id
router.delete('/:id', deleteUser);

// export
module.exports = router;



