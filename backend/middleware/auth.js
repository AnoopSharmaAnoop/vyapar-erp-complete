const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user info
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      companyId: decoded.companyId, // ✅ Company ID from token ONLY
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

// Middleware to check if user has access to specific company
exports.authorizeCompany = async (req, res, next) => {
  try {
    const requestedCompanyId = parseInt(req.params.companyId || req.body.companyId);
    const userCompanyId = req.user.companyId;

    if (requestedCompanyId && requestedCompanyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot access another company\'s data.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization failed.',
    });
  }
};
