const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { generateToken } = require('../utils/token');

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'PLAYER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);

    return res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  return res.status(200).json({
    message: 'Logged out successfully.',
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

// POST /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isCurrentMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentMatch) {
      return res.status(400).json({
        message: 'Incorrect current password.',
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      return res.status(400).json({
        message: 'New password cannot be the same as your current password.',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.status(200).json({
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  logout,
  getMe,
  changePassword,
};
