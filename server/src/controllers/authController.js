import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, collegeName, phone } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      collegeName,
      phone
    })

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account locked. Try again later' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      user.failedLoginAttempts += 1
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000
      }
      await user.save()
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    user.failedLoginAttempts = 0
    user.lockUntil = null
    await user.save()

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      collegeName: req.user.collegeName,
      phone: req.user.phone
    }
  })
}

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { email, name, sub: googleId, picture } = payload

    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: 'student',
        profilePic: picture
      })
    } else if (!user.googleId) {
      user.googleId = googleId
      user.authProvider = 'google'
      await user.save()
    }

    const accessToken = generateAccessToken(user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken
    })
  } catch (error) {
    console.error('Google auth error:', error.message)
    res.status(401).json({ message: 'Google authentication failed' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, collegeName } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (name) user.name = name
    if (phone) user.phone = phone
    if (collegeName) user.collegeName = collegeName

    await user.save()

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        phone: user.phone
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email collegeName phone authProvider createdAt')
      .lean()

    const Document = (await import('../models/Document.js')).default

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const totalDocuments = await Document.countDocuments({ student: student._id })
        const verifiedDocuments = await Document.countDocuments({
          student: student._id,
          status: 'verified',
        })

        return {
          ...student,
          totalDocuments,
          verifiedDocuments,
        }
      })
    )

    res.status(200).json(studentsWithStats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}