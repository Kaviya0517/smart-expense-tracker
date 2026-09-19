const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in request header
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object
      req.user = await User.findById(decoded.id).select('-password');

      next(); // move to next function
    } else {
      res.status(401).json({ message: 'Not authorized, no token' });
    }

  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };