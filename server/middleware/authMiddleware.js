const JWT = require('jsonwebtoken');

exports.protect = (req, res, next) =>{
    let token = null
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({message: 'Not Authorized!'});

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: "Invalid token!"})
    }
};
