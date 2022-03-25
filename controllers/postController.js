const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Post = require('../models/post');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');

exports.postCreate = [
  passport.authenticate('jwt', { session: false }),
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Post content cannot be empty')
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // get id from jwt token
      const userId = getUserIdFromHeader(req.headers['authorization']);

      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: userId,
      });

      await post.save();
      res.json({ message: 'Post Created' });
    } catch (error) {
      next(error);
    }
  },
];

exports.getPostList = async (req, res, next) => {
  try {
    const posts = await Post.find({}, '-__v')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .exec();

    res.json({ posts: posts });
  } catch (error) {
    next(error);
  }
};
