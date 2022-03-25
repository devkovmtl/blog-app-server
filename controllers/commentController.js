const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');
const Comment = require('../models/comment');
const { isAdmin } = require('../middlewares/isAdmin');

exports.createComment = [
  passport.authenticate('jwt', { session: false }),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Comment content is required')
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const userId = getUserIdFromHeader(req.headers['authorization']);

      const comment = new Comment({
        content: req.body.content,
        author: userId,
        post: req.params.postId,
      });
      await comment.save();
      res.json({ success: true, message: 'Comment created' });
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
      const deletedComment = await Comment.findByIdAndRemove(
        req.params.commentId
      );

      if (!deletedComment) {
        return res
          .status(404)
          .json({ success: false, message: 'No comment found' });
      }
      res.json({ success: true, message: 'Comment deleted!' });
    } catch (error) {
      next(error);
    }
  },
];
