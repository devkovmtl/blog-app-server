const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { getUserIdFromHeader } = require('../utils/getUserIdFromHeader');
const Comment = require('../models/comment');

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
