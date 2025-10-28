const User = require('../models/User');

// getting all users

exports.getUsers = async (req, res, next) =>{
    try {
        const users = await User.find().sort('username')
        res.json(users)    
    } catch (error) {
        next(error)
    }
};

// get user by id
exports.getUser = async (req, res, next) =>{
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(400).json({message: 'User not found'})
        
        res.json(user)
    } catch (error) {
        next(error)
    }
};

// create new user
exports.createUser = async (req, res, next) =>{ 
    try {
        const {username, email, password } = req.body
        const newUser = new User({ username, email, password })
        await newUser.save()
        res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
};

// update user by id
exports.updateUser = async (req, res, next) =>{
    try {
       const user = await User.findByIdAndUpdate(req.params.id, {username: req.body.username, 
        email: req.body.email, 
        password: req.body.password}, 
        {new: true, 
        runValidators: true})
        if(!user) 
            return res.status(404).json({message: 'User not found!'})

        res.status(200).json({message: 'User updated successfully', user})
    } catch (error) {
        next(error)
    }
};


// delete user by id
exports.deleteUser = async (req, res, next) =>{
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user) 
            return res.status(404).json({message: 'User not found!'})

        res.status(200).json({message: 'User deleted successfully', user})
    } catch (error) {
        next(error)
    }
}