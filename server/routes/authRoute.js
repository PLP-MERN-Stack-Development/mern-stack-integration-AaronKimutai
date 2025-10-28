const express = require('express')
const router = express.Router()
const JWT = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')


router.post('/register', async(req, res) =>{
    try {
         const { username, email, password} = req.body

         if (!username || !email || !password)
            return res.status(400).json({message: "All fields are required"})

         const existingUser = await User.findOne({ email })
         if (existingUser)
            return res.status(400).json({message: "User with the email already exists"})

         const newUser = await User.create({
            username,
            email,
            password 
         })
         
         const token = JWT.sign({ id: newUser._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
         
         res.status(201).json({
            message: "User registered successfully",
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
            token
         })       

    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({message: "Server error during registration!" , error: error.message})
    } 
});

// login route
router.post('/login', async(req, res) =>{
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+password'); 
        if (!user)
            return res.status(400).json({message: "Invalid credentials"}); 
        
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch)
            return res.status(401).json({message: "Invalid credentials"}); 

        const token = JWT.sign({ id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        
        res.json({
            message: "Login successfull", 
            token,
            user: { id: user._id, username: user.username, email: user.email } 
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({message: 'Server error', error: error.message});
    }
});

// export 
module.exports = router;