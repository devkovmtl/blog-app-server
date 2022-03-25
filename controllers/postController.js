const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Post = require('../models/post');
const { isAdmin } = require('../middlewares/isAdmin');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');

exports.postCreate = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
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
        isPublished: req.body.isPublished,
      });

      await post.save();
      res.json({ success: true, message: 'Post Created' });
    } catch (error) {
      next(error);
    }
  },
];

exports.getPostList = async (req, res, next) => {
  try {
    const posts = await Post.find({}, '-__v')
      .populate('author', 'username')
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    res.json({ success: true, posts: posts });
  } catch (error) {
    next(error);
  }
};

exports.getPostDetail = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId, '-__v')
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: '_id username' },
      });

    if (!post) {
      res.status(404).json({ message: 'No post found', post: {} });
    }
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
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
      if (!req.headers['authorization']) {
        return res.status(403).json({ error: 'You must login first.' });
      }
      const userId = getUserIdFromHeader(req.headers['authorization']);
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: userId,
        isPublished: req.body.isPublished,
        _id: req.params.postId,
      });

      const newPost = await Post.findByIdAndUpdate(req.params.postId, post, {});
      return res.json({ success: true, message: 'Post updated', newPost });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
];

exports.deletePost = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res, next) => {
    try {
      await Post.findByIdAndRemove(req.params.postId);
      res.json({ success: true, message: 'Post deleted!' });
    } catch (error) {
      next(error);
    }
  },
];
