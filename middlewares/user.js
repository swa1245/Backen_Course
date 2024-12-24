const jwt = require("jsonwebtoken");
const {JWT_USER} = require('../config')

function userMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // Remove 'Bearer ' prefix if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

    try {
      const decoded = jwt.verify(tokenString, JWT_USER);
      req.userId = decoded.id;
      next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during authentication"
    });
  }
}

module.exports = {
  userMiddleware
};
