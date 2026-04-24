const User = require('../models/User')
const { signToken } = require('../utils/jwt')

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatarUrl: user.avatarUrl },
  })
}
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })
    const user = await User.create({ name, email, password })
    sendToken(user, 201, res)
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    sendToken(user, 200, res)
  } catch (err) { next(err) }
}

exports.logout = (req, res) => res.json({ message: 'Logged out' })

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user)
  } catch (err) { next(err) }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    )
    res.json(user)
  } catch (err) { next(err) }
}

exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false })
    user.addresses.push(req.body)
    await user.save()
    res.status(201).json(user.addresses)
  } catch (err) { next(err) }
}

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId)
    await user.save()
    res.json(user.addresses)
  } catch (err) { next(err) }
}
