const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');
const Comment = require('../models/comment');
const { isAdmin } = require('../middlewares/isAdmin');

exports.createComment = [
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Comment content is required')
    .escape(),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Create comment failed',
        comment: null,
        errors: errors.array(),
      });
    }
    try {
      const comment = new Comment({
        content: req.body.content,
        username: req.body.username,
        post: req.params.postId,
      });
      await comment.save();
      res.json({
        success: true,
        message: 'Comment created',
        comment,
        errors: null,
      });
    } catch (error) {
      next(error);
    }
  },
];

exports.deleteComment = [
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  async (req, res, next) => {
    try {
      await Comment.findByIdAndRemove(req.params.commentId);
      res.json({ success: true, message: 'Comment deleted', errors: null });
    } catch (error) {
      next(error);
    }
  },
];
