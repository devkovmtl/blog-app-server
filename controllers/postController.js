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
      return res.status(400).json({
        success: false,
        message: 'Error create post failed',
        post: null,
        errors: errors.array(),
      });
    }
    try {
      // get id from jwt token
      const userId = getUserIdFromHeader(req.headers['authorization']);

      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: userId,
        isPublished: req.body.isPublished || false,
      });

      await post.save();
      res.json({ success: true, message: 'Post Created', post, errors: null });
    } catch (error) {
      next(error);
    }
  },
];

exports.getPostList = async (req, res, next) => {
  try {
    const posts = await Post.find({}, '-__v')
      .populate('author', 'username')
      .populate('commentCount')
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    res.json({
      success: true,
      message: 'Fetch post success',
      posts: posts,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostDetail = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId, '-__v')
      .populate('author', 'username')
      .populate('comments');
    // .populate({
    //   path: 'comments',
    //   populate: { path: 'author', select: '_id username' },
    // });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'No post found',
        post: {},
        errors: [{ param: 'post', msg: 'No post found with provided id' }],
      });
    }
    return res.json({
      success: true,
      message: 'Post found',
      post,
      errors: null,
    });
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
      return res.status(400).json({
        success: false,
        message: 'Error could not update post',
        post: null,
        errors: errors.array(),
      });
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

      await Post.findByIdAndUpdate(req.params.postId, post, {});
      return res.json({
        success: true,
        message: 'Post updated success',
        post,
        errors: null,
      });
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
      res.json({ success: true, message: 'Post deleted', errors: null });
    } catch (error) {
      next(error);
    }
  },
];
