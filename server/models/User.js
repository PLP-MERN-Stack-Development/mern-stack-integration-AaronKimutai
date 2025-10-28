const mongoose = require('mongoose')
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, "Username is required"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [50, "Username must not exceed 50 characters long"],
        unique: true 
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address!"]
    },
    password: {
        type: String,
        required: [true, "Your password is required"],
        minlength: [6, "Password  must be at least 6 characters long"], 
        select: false 
    },
},
{timestamps: true}
);


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


// model
const User = mongoose.model("User", userSchema) 

// export
module.exports = User;