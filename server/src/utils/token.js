const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    return process.env.JWT_SECRET;
  }
  return process.env.JWT_SECRET || 'sportsync_dev_secret_jwt_key_wd501_capstone_2026';
}

// Validate on startup if in production
if (process.env.NODE_ENV === 'production') {
  getJwtSecret();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  getJwtSecret,
  generateToken,
  verifyToken,
};
