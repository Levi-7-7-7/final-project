// // middleware/tutorAuth.js
// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== 'tutor') {
//       return res.status(403).json({ error: 'Not authorized as tutor' });
//     }

//     req.tutor = { id: decoded.id, role: 'tutor' };
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };


// middleware/tutorAuth.js

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify a user is authenticated and has the 'tutor' role.
 * * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
module.exports = (req, res, next) => {
    // 1. Get the Authorization header
    const header = req.headers.authorization;
    // Check if the header exists
    if (!header) {
        // 401 Unauthorized: No token was provided in the request
        return res.status(401).json({ error: 'No token provided' });
    }

    // 2. Extract the token (Bearer <token>)
    const token = header.split(' ')[1];
    
    try {
        // 3. Verify and decode the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Check the role
        if (decoded.role !== 'tutor') {
            // 403 Forbidden: Token is valid but the user lacks the necessary role
            return res.status(403).json({ error: 'Not authorized as tutor' });
        }
        
        // 5. Attach decoded tutor info to the request object and proceed
        req.tutor = decoded; 
        next();
        
    } catch (err) {
        // 401 Unauthorized: Token is invalid (e.g., expired, malformed signature)
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};