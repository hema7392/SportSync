const prisma = require('../prisma');
const { verifyToken } = require('../utils/token');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User associated with this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('requireAuth error:', error);
    return res.status(500).json({ message: 'Internal authentication error.' });
  }
}

module.exports = {
  requireAuth,
};
