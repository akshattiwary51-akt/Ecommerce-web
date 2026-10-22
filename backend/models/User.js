const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
  line1:      { type: String, required: true },
  line2:      String,
  city:       { type: String, required: true },
  state:      { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, default: 'India' },
  isDefault:  { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema({
  name:         { type: String, required: [true, 'Name is required'], trim: true },
  email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:     { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone:        String,
  avatarUrl:    String,
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses:    [addressSchema],
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', userSchema)
