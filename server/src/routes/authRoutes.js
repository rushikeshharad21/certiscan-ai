import express from 'express'
import { registerUser, loginUser, getMe, googleAuth, updateProfile, getAllStudents } from '../controllers/authController.js'
import { protect, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/google', googleAuth)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.get('/admin/students', protect, isAdmin, getAllStudents)

export default router