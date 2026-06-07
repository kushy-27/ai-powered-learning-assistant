const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if(err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found. Invalid: ' + err.path;
    }

    if(err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        statusCode = 400;
        message = `Duplicate value for field: ${field}. Please use another value.`;
    }

    if(err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    if(err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if(err.name === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size exceeds the limit.';
    }

    if(err.name==='TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    console.error('Error:', {
        message: err.message,
        stack : process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode, 
        ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack })
    });
};

export default errorHandler;
