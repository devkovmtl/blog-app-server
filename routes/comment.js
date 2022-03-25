const { Router } = require('express');
const router = Router();
const commentController = require('../controllers/commentController');

/* CREATE a COMMENT */
router.post('/:postId', commentController.createComment);

module.exports = router;
