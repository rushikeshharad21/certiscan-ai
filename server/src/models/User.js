import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 8,
      select: false
    },
    googleId: {
      type: String,
      default: null
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    collegeName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    profilePic: {
      type: String,
      default: ''
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User