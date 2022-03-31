const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const { getJWTTOKEN } = require('../config/passport');

exports.register = [
  body('username', 'Username is required').trim().isLength({ min: 1 }).escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Provide a valid email'),
  body('password', 'Password must be at least 8 characters')
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body('confirmPassword')
    .trim()
    .isLength({ min: 8 })
    .escape()
    .withMessage('Confirm Password is required')
    .escape()
    .custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      // success
      return true;
    }),
  // Handle the request
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        message: 'Registration Failed',
        user: null,
        errors: errors.array(),
      });
    }
    // check if username exist
    const usernameExist = await User.findOne({
      success: false,
      user: null,
      username: req.body.username,
    });
    if (usernameExist) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
        user: null,
        errors: [{ param: 'username', msg: 'Username already taken' }],
      });
    }
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: 'Email already taken',
        user: null,
        errors: [{ param: 'email', msg: 'Email already taken' }],
      });
    }

    // create new user
    bcrypt.hash(req.body.password, 12, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      try {
        await user.save();
        // create the token and send them
        const token = getJWTTOKEN(user);

        return res.status(200).json({
          success: true,
          message: 'Registration success',
          token,
          user: {
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          errors: null,
        });
      } catch (error) {
        return next(error);
      }
    });
  },
];

exports.login = async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user) => {
    try {
      if (err) {
        console.log(err);
        const error = new Error('An error occurred');
        return next(error);
      }
      if (!user) {
        return res.json({
          success: false,
          message: 'Invalid credentials',
          user: null,
          errors: [{ param: '', msg: 'Invalid credentials' }],
        });
      }
      req.login(user, { session: false }, async (error) => {
        const token = getJWTTOKEN(user);

        return res.json({
          success: true,
          message: 'Login Success',
          token,
          user: {
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          errors: null,
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

exports.checkJWTToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (info) {
      console.log(info.message);
      res.statusCode = 401;
      return res.json({
        success: false,
        message: info.message,
        user: null,
        token: null,
        errors: [{ param: '', msg: info.message }],
      });
    }
    if (!user) {
      res.statusCode = 401;
      return res.json({
        success: false,
        message: 'Error checking JWT token',
        user: null,
        token: null,
        errors: [{ param: '', msg: 'Error checking JWT' }],
      });
    }
    if (user) {
      res.statusCode = 200;
      return res.json({
        success: true,
        message: 'JWT valid',
        token: getJWTTOKEN(user),
        user: { _id: user._id, username: user.username, isAdmin: user.isAdmin },
        error: null,
      });
    }
  })(req, res, next);
};
