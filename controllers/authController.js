const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

const { JWT_TOKEN_SECRET } = process.env;

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
      return res.json({ errors: errors.array() });
    }
    // check if username exist
    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist) {
      return res.status(400).json({ errors: 'Username already taken' });
    }
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      return res.status(400).json({ errors: 'Email already taken' });
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
        const token = jwt.sign(
          {
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          JWT_TOKEN_SECRET,
          { expiresIn: 60 * 60 }
        );

        return res.status(200).json({
          token,
          user: {
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
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
      if (err || !user) {
        const error = new Error('An error occurred');
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        const token = jwt.sign(
          { _id: user._id, username: user.username, isAdmin: user.isAdmin },
          JWT_TOKEN_SECRET,
          { expiresIn: 60 * 60 }
        );

        return res.json({
          token,
          user: {
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
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
    if (!user) {
      res.statusCode = 401;
      return res.json({ success: false, error: info, user: null });
    }
    if (user) {
      res.statusCode = 200;
      return res.json({
        success: true,
        error: null,
        user: { _id: user._id, username: user.username, isAdmin: user.isAdmin },
      });
    }
  })(req, res, next);
};
