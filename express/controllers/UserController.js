import express from 'express';
import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

// Email validation regex (basic)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const MIN_PASSWORD_LENGTH = 8;


const router = express.Router();
export default router;

// Поля, которые разрешено создавать/обновлять через API
const validFields = {
    email: 'string',
    password: 'string',
    name: 'string'
};

function validateEmail(email) {
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

function buildCleanData(body) {
  const cleanData = {};

  for (const field in validFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== validFields[field]) {
        throw new Error(
          `Invalid type for field ${field}, should be ${validFields[field]}.`
        );
      }
      cleanData[field] = field === 'password' ? body[field] : body[field].trim();
    }
  }

  if (cleanData.email) {
    cleanData.email = cleanData.email.toLowerCase();
  }

  return cleanData;
}

// POST /register – регистрация нового пользователя
router.post('/register', async function (req, res) {
  let cleanData;
  try {
    cleanData = buildCleanData(req.body);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  // Validate required fields
  if (!cleanData.email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!cleanData.password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Validate email format
  if (!validateEmail(cleanData.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (!validatePassword(cleanData.password)) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
  }

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email: cleanData.email }
    });
  } catch (e) {
    console.error('Error checking existing user:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (existingUser) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  // Hash password
  try {
    cleanData.password = await bcrypt.hash(cleanData.password, 12);
  } catch (e) {
    console.error('Error hashing password:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Create new user
  try {
    const newUser = await prisma.user.create({
      data: cleanData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        password: false
      }
    });

    // TODO: Send confirmation email
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`New user registered: ${newUser.email}. TODO: Send confirmation email.`);

    res.status(201).json({
      message: 'Registration successful. Please check your email for confirmation instructions.',
      user: newUser
    });
  } catch (e) {
    console.error('Error creating user:', e);
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login – вход пользователя
router.post('/login', async function (req, res) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Validate email format
  if (!validateEmail(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return token and user info (without password)
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (e) {
    console.error('Error during login:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /change-password – изменение пароля пользователя
router.put('/change-password', authenticateToken, async function (req, res) {
  // Assume user is authenticated via middleware (req.user contains user info)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!currentPassword) {
    return res.status(400).json({ error: 'Current password is required' });
  }
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  // Validate new password strength
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
  }

  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    console.error('Error changing password:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /change-email – изменение email пользователя
router.put('/change-email', async function (req, res) {
  // Assume user is authenticated via middleware (req.user contains user info)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { newEmail, password } = req.body;

  // Validate required fields
  if (!newEmail) {
    return res.status(400).json({ error: 'New email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required for email change' });
  }

  // Validate email format
  if (!validateEmail(newEmail.trim())) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.trim() }
    });

    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: newEmail.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
        password: false
      }
    });

    // TODO: Send email confirmation to new email address
    console.log(`Email changed for user ${req.user.id}: ${user.email} -> ${newEmail}. TODO: Send confirmation email.`);

    res.json({
      message: 'Email changed successfully. Please check your new email for confirmation.',
      user: updatedUser
    });
  } catch (e) {
    console.error('Error changing email:', e);
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Email is already in use' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});