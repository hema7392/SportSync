// Authentication and RBAC Middleware for CampusFix
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// Validate JWT_SECRET on startup in production
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    }
    return 'campusfix_dev_secret_fallback_key';
  }
  return secret;
};

/**
 * Verifies Bearer JWT token and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Invalid token format.' });
    }

    const secret = getJwtSecret();
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * e.g. authorize('ADMIN') or authorize('ADMIN', 'TECHNICIAN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  getJwtSecret,
};
