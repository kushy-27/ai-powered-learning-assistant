import express from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authControllers.js';

import protect from '../middleware/auth.js';

const router = express.Router();

const registerValidation = [
  body('username')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;