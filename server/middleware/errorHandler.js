function errorHandler (err, req, res, next) {
    console.error(err.stack); 
    
    const status = res.statusCode === 200 ? err.status || 500 : res.statusCode; 
    res.status(status).json({
        message: err.message || "An unexpected server error occurred!", 
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
}

module.exports = errorHandler;