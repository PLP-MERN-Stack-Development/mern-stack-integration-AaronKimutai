const { validationResult } = require('express-validator');

exports.handleValidation = (req, res, next) =>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const err = new Error ("Validation Failed!");
        err.status = 422
        err.errors= errors.array();
        return next(err)
    }
    next ();
};

