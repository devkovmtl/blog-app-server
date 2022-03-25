const { Router } = require('express');
const router = Router();

const commentController = require('../controllers/commentController');

/* CREATE a COMMENT */
router.post('/:postId', commentController.createComment);

/* DELETE a COMMENT */
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
